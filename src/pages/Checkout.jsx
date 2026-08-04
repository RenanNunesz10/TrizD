import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck, CreditCard, ArrowLeft, Tag, Trash2, Plus, Minus, X } from 'lucide-react';

export default function Checkout() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCartStore();
  const { user, perfil } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [enderecosSalvos, setEnderecosSalvos] = useState([]);
  const [salvarNovoEndereco, setSalvarNovoEndereco] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('cartao');

  // --- ESTADOS DO CUPOM ---
  const [codigoCupom, setCodigoCupom] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [loadingCupom, setLoadingCupom] = useState(false);

  const [formData, setFormData] = useState({
    nome: perfil?.nome || '',
    email: user?.email || '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    complemento: '',
    titulo: 'Casa'
  });

  useEffect(() => {
    if (perfil?.nome) setFormData((prev) => ({ ...prev, nome: perfil.nome }));
    if (user?.email) setFormData((prev) => ({ ...prev, email: user.email }));

    async function fetchEnderecos() {
      if (!user) return;
      const { data } = await supabase.from('enderecos').select('*').eq('user_id', user.id);
      if (data) setEnderecosSalvos(data);
    }
    fetchEnderecos();
  }, [user, perfil]);

  const handleSelecionarEnderecoSalvo = (e) => {
    const enderecoId = e.target.value;
    
    if (!enderecoId) {
      setFormData((prev) => ({
        ...prev, cep: '', rua: '', numero: '', bairro: '', cidade: '', complemento: ''
      }));
      return;
    }

    const selecionado = enderecosSalvos.find((end) => end.id === enderecoId);
    if (selecionado) {
      setFormData((prev) => ({
        ...prev,
        cep: selecionado.cep,
        rua: selecionado.rua,
        numero: selecionado.numero,
        bairro: selecionado.bairro,
        cidade: selecionado.cidade,
        complemento: selecionado.complemento || '',
      }));
      toast.success(`Endereço "${selecionado.titulo}" aplicado!`);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const buscarCEP = async (cepBuscado) => {
    const cepLimpo = cepBuscado.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado. Verifique o número digitado.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: `${data.localidade} / ${data.uf}`,
        cep: data.cep
      }));
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro de conexão ao buscar o CEP.');
    }
  };

  // --- LÓGICA DE VALIDAÇÃO DE CUPOM ---
  const handleAplicarCupom = async () => {
    if (!codigoCupom.trim()) return toast.error('Digite um código de cupom.');
    
    setLoadingCupom(true);
    try {
      const { data, error } = await supabase
        .from('cupons')
        .select('*')
        .eq('codigo', codigoCupom.toUpperCase().trim())
        .eq('ativo', true)
        .single();

      if (error || !data) {
        toast.error('Cupom inválido ou expirado.');
        setCupomAplicado(null);
      } else {
        setCupomAplicado(data);
        toast.success('Cupom aplicado com sucesso!');
      }
    } catch (err) {
      toast.error('Erro ao validar o cupom.');
    } finally {
      setLoadingCupom(false);
    }
  };

  const removerCupom = () => {
    setCupomAplicado(null);
    setCodigoCupom('');
    toast('Cupom removido.', { icon: '🗑️' });
  };

  const parsePreco = (preco) => {
    if (typeof preco === 'number') return preco;
    const num = parseFloat(preco.replace('R$', '').replace('.', '').replace(',', '.').trim());
    return isNaN(num) ? 0 : num;
  };

  // --- CÁLCULOS FINANCEIROS ---
  const subtotal = cart.reduce((acc, item) => acc + (parsePreco(item.preco) * (item.quantidade || 1)), 0);
  
  let valorDescontoCupom = 0;
  if (cupomAplicado) {
    if (cupomAplicado.tipo === 'porcentagem') {
      valorDescontoCupom = subtotal * (Number(cupomAplicado.valor) / 100);
    } else {
      valorDescontoCupom = Number(cupomAplicado.valor);
    }
  }

  // O total nunca pode ser menor que zero
  const totalCalculado = Math.max(0, subtotal - valorDescontoCupom);

  const handleFinalizarPedido = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Você precisa estar logado para finalizar o pedido!');
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }

    setLoading(true);

    try {
      const enderecoCompleto = `${formData.rua}, ${formData.numero}${formData.complemento ? ' (' + formData.complemento + ')' : ''} - ${formData.bairro}, ${formData.cidade} - CEP: ${formData.cep}`;

      if (salvarNovoEndereco) {
        await supabase.from('enderecos').insert([{
          user_id: user.id,
          titulo: formData.titulo || 'Novo Endereço',
          rua: formData.rua,
          numero: formData.numero,
          bairro: formData.bairro,
          cidade: formData.cidade,
          cep: formData.cep,
          complemento: formData.complemento,
        }]);
      }

      const { data: pedido, error: errorPedido } = await supabase
        .from('pedidos')
        .insert([{ user_id: user.id, status: 'Aguardando Pagamento', total: totalCalculado, endereco_entrega: enderecoCompleto }])
        .select()
        .single();

      if (errorPedido) throw errorPedido;

      const itensParaInserir = cart.map((item) => ({
        pedido_id: pedido.id,
        nome_produto: item.cor_escolhida ? `${item.nome} (${item.cor_escolhida})` : item.nome,
        preco_unitario: parsePreco(item.preco),
        quantidade: item.quantidade || 1
      }));

      const { error: errorItens } = await supabase.from('itens_pedido').insert(itensParaInserir);
      if (errorItens) throw errorItens;

      toast.success('Pedido realizado com sucesso! 🎉');
      clearCart();
      navigate('/perfil');

    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      toast.error('Erro ao processar o pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu carrinho está vazio</h2>
        <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
          <ArrowLeft size={18}/> Voltar para a loja
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <Lock size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Checkout Seguro</h2>
          <p className="text-gray-500 mb-8">Faça login para salvar seus dados e acompanhar o pedido.</p>
          <button onClick={() => navigate('/login')} className="w-full bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-black transition mb-3">Entrar na Conta</button>
          <button onClick={() => navigate('/cadastro')} className="w-full bg-white text-gray-800 border border-gray-200 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition">Criar Conta</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <Link to="/" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2">
            <ArrowLeft size={20} /> <span className="font-medium">Voltar para a loja</span>
          </Link>
          <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
            <ShieldCheck size={18} /> Checkout Seguro
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-7 space-y-8">
            
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informações de Envio</h2>
              
              {enderecosSalvos.length > 0 && (
                <div className="mb-6 p-1 border border-gray-200 rounded-xl bg-gray-50/50 flex">
                  <select onChange={handleSelecionarEnderecoSalvo} className="w-full p-3 bg-transparent font-medium text-gray-700 outline-none cursor-pointer text-sm">
                    <option value="">Usar um endereço diferente...</option>
                    {enderecosSalvos.map((end) => (
                      <option key={end.id} value={end.id}>{end.titulo} - {end.rua}, {end.numero}</option>
                    ))}
                  </select>
                </div>
              )}

              <form id="checkout-form" onSubmit={handleFinalizarPedido} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo</label>
                    <input required type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">E-mail</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition text-sm font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CEP</label>
                    <input required type="text" name="cep" maxLength="9" placeholder="00000-000" value={formData.cep} onChange={handleChange} onBlur={(e) => buscarCEP(e.target.value)} className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Cidade / Estado</label>
                    <input required type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition text-sm font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rua / Avenida</label>
                    <input required type="text" name="rua" value={formData.rua} onChange={handleChange} className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Número</label>
                    <input required type="text" name="numero" value={formData.numero} onChange={handleChange} className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition text-sm font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bairro</label>
                    <input required type="text" name="bairro" value={formData.bairro} onChange={handleChange} className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Complemento (Opcional)</label>
                    <input type="text" name="complemento" placeholder="Apt, Bloco..." value={formData.complemento} onChange={handleChange} className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition text-sm font-medium" />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <input type="checkbox" id="salvarEndereco" checked={salvarNovoEndereco} onChange={(e) => setSalvarNovoEndereco(e.target.checked)} className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-gray-900 cursor-pointer accent-gray-900"/>
                  <label htmlFor="salvarEndereco" className="text-sm font-medium text-gray-600 cursor-pointer">
                    Salvar estas informações para a próxima compra
                  </label>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Método de Pagamento</h2>
              <div className="space-y-3">
                <div onClick={() => setMetodoPagamento('cartao')} className={`p-4 border rounded-2xl cursor-pointer flex items-center gap-3 transition ${metodoPagamento === 'cartao' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${metodoPagamento === 'cartao' ? 'border-gray-900' : 'border-gray-300'}`}>
                    {metodoPagamento === 'cartao' && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
                  </div>
                  <CreditCard size={20} className="text-gray-500" />
                  <span className="font-bold text-sm text-gray-800">Cartão de Crédito/Débito</span>
                </div>
                
                {metodoPagamento === 'cartao' && (
                  <div className="px-2 pb-4 pt-2 space-y-4 animate-fade-in">
                     <input type="text" placeholder="Número do Cartão" className="w-full p-3.5 border border-gray-200 rounded-xl bg-white outline-none text-sm font-medium" disabled />
                     <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/AA" className="w-full p-3.5 border border-gray-200 rounded-xl bg-white outline-none text-sm font-medium" disabled />
                        <input type="text" placeholder="CVC" className="w-full p-3.5 border border-gray-200 rounded-xl bg-white outline-none text-sm font-medium" disabled />
                     </div>
                  </div>
                )}

                <div onClick={() => setMetodoPagamento('pix')} className={`p-4 border rounded-2xl cursor-pointer flex items-center gap-3 transition ${metodoPagamento === 'pix' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${metodoPagamento === 'pix' ? 'border-gray-900' : 'border-gray-300'}`}>
                    {metodoPagamento === 'pix' && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
                  </div>
                  <div className="w-5 h-5 bg-teal-500 rounded text-white flex items-center justify-center text-[10px] font-black">P</div>
                  <span className="font-bold text-sm text-gray-800">PIX (Aprovação Imediata)</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO DO CUPOM ATUALIZADA */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
               {cupomAplicado ? (
                 <div className="flex-1 flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-xl">
                   <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                     <Tag size={18} />
                     Cupom {cupomAplicado.codigo} aplicado! (-{cupomAplicado.tipo === 'porcentagem' ? `${cupomAplicado.valor}%` : `R$ ${cupomAplicado.valor}`})
                   </div>
                   <button type="button" onClick={removerCupom} className="text-green-700 hover:text-red-600 transition p-1 cursor-pointer" title="Remover cupom">
                     <X size={18} />
                   </button>
                 </div>
               ) : (
                 <>
                   <div className="flex-1 relative">
                     <Tag className="absolute left-4 top-3.5 text-gray-400" size={18} />
                     <input 
                       type="text" 
                       placeholder="Insira o código promocional" 
                       value={codigoCupom}
                       onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                       className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gray-900 outline-none text-sm font-bold uppercase placeholder:normal-case" 
                     />
                   </div>
                   <button 
                     type="button" 
                     onClick={handleAplicarCupom}
                     disabled={loadingCupom || !codigoCupom}
                     className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3.5 rounded-xl font-bold transition disabled:opacity-50 cursor-pointer"
                   >
                     {loadingCupom ? '...' : 'Aplicar'}
                   </button>
                 </>
               )}
            </div>

          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.imagem_url ? (
                        <img src={item.imagem_url} alt={item.nome} className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{item.nome}</h4>
                      {item.cor_escolhida && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          Cor: <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-200" style={{ backgroundColor: item.cor_hex || '#000' }} /> {item.cor_escolhida}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 w-fit">
                          <button type="button" onClick={() => updateQuantity(index, item.quantidade - 1)} className="text-gray-400 hover:text-gray-900 cursor-pointer"><Minus size={14}/></button>
                          <span className="text-xs font-bold text-gray-900 w-3 text-center">{item.quantidade || 1}</span>
                          <button type="button" onClick={() => updateQuantity(index, (item.quantidade || 1) + 1)} className="text-gray-400 hover:text-gray-900 cursor-pointer"><Plus size={14}/></button>
                        </div>
                        <button type="button" onClick={() => removeFromCart(index)} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer">
                          <Trash2 size={12}/> Remover
                        </button>
                      </div>
                    </div>

                    <div className="font-bold text-gray-900 text-sm">
                      R$ {(parsePreco(item.preco) * (item.quantidade || 1)).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                
                {/* MOSTRA O DESCONTO DO CUPOM APLICADO */}
                {cupomAplicado && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span>Cupom ({cupomAplicado.codigo})</span>
                    <span>- R$ {valorDescontoCupom.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Frete</span>
                  <span className="text-gray-900">R$ 15,00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Desconto (Frete Grátis)</span>
                  <span className="text-green-600">- R$ 15,00</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-center text-xl">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-gray-900">R$ {totalCalculado.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="bg-blue-50/50 text-blue-700 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 mb-6 border border-blue-100">
                <ShieldCheck size={16} /> Frete grátis liberado para sua região
              </div>

              <button form="checkout-form" type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2">
                {loading ? 'Processando...' : 'Fazer Pedido'}
              </button>

              <div className="flex justify-center gap-6 mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span className="flex items-center gap-1"><Lock size={12}/> Pagamento Seguro</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12}/> SSL Encriptado</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}