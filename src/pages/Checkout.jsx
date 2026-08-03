import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, clearCart } = useCartStore();
  const { user, perfil } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [enderecosSalvos, setEnderecosSalvos] = useState([]);
  const [salvarNovoEndereco, setSalvarNovoEndereco] = useState(false);

  // Formulário completo
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

  // Aplica um endereço salvo selecionado
  const handleSelecionarEnderecoSalvo = (e) => {
    const enderecoId = e.target.value;
    
    if (!enderecoId) {
      // Limpa os campos para digitação manual
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

  // Busca do CEP no Checkout
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
      
      toast.success('Endereço encontrado!', { icon: '📍' });
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro de conexão ao buscar o CEP.');
    }
  };

  const parsePreco = (preco) => {
    if (typeof preco === 'number') return preco;
    const num = parseFloat(preco.replace('R$', '').replace('.', '').replace(',', '.').trim());
    return isNaN(num) ? 0 : num;
  };

  // ATUALIZADO: Multiplica o preço pela quantidade do item
  const totalCalculado = cart.reduce((acc, item) => acc + (parsePreco(item.preco) * (item.quantidade || 1)), 0);

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
      // Formata a string completa de entrega para a tabela de pedidos
      const enderecoCompleto = `${formData.rua}, ${formData.numero}${formData.complemento ? ' (' + formData.complemento + ')' : ''} - ${formData.bairro}, ${formData.cidade} - CEP: ${formData.cep}`;

      // 1. Opcional: Se o usuário marcou para salvar o endereço novo no perfil dele
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

      // 2. Salva o pedido principal
      const { data: pedido, error: errorPedido } = await supabase
        .from('pedidos')
        .insert([{ user_id: user.id, status: 'Em Impressão 3D', total: totalCalculado, endereco_entrega: enderecoCompleto }])
        .select()
        .single();

      if (errorPedido) throw errorPedido;

      // 3. Salva os itens do pedido (ATUALIZADO COM COR E QUANTIDADE)
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
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu carrinho está vazio</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline cursor-pointer">Voltar para a loja</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito 🔒</h2>
        <p className="text-gray-600 mb-6">Você precisa estar logado para acessar o pagamento.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer">Fazer Login</button>
          <button onClick={() => navigate('/cadastro')} className="bg-gray-100 text-gray-800 border border-gray-300 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition cursor-pointer">Criar Conta</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row mt-8">
      <div className="w-full md:w-2/3 p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dados de Entrega</h2>

        {/* Seletor de Endereços Salvos */}
        {enderecosSalvos.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-bold text-blue-800 mb-2">Usar um Endereço Salvo:</label>
            <select onChange={handleSelecionarEnderecoSalvo} className="w-full p-2 border border-blue-300 rounded bg-white font-medium text-gray-700 outline-none cursor-pointer">
              <option value="">-- Digitar outro endereço --</option>
              {enderecosSalvos.map((end) => (
                <option key={end.id} value={end.id}>{end.titulo} - {end.rua}, {end.numero}</option>
              ))}
            </select>
          </div>
        )}

        <form id="checkout-form" onSubmit={handleFinalizarPedido} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input required type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input 
                required 
                type="text" 
                name="cep" 
                maxLength="9"
                placeholder="00000-000"
                value={formData.cep} 
                onChange={handleChange} 
                onBlur={(e) => buscarCEP(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade / Estado</label>
              <input required type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Avenida</label>
              <input required type="text" name="rua" value={formData.rua} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input required type="text" name="numero" value={formData.numero} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input required type="text" name="bairro" value={formData.bairro} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento (Opcional)</label>
              <input type="text" name="complemento" placeholder="Apt, Bloco..." value={formData.complemento} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          {/* Opção de salvar no perfil caso seja um endereço digitado manualmente */}
          <div className="pt-2 flex items-center gap-2">
            <input 
              type="checkbox" 
              id="salvarEndereco" 
              checked={salvarNovoEndereco} 
              onChange={(e) => setSalvarNovoEndereco(e.target.checked)} 
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="salvarEndereco" className="text-sm font-medium text-gray-700 cursor-pointer">
              Salvar este novo endereço no meu perfil para próximas compras
            </label>
          </div>
        </form>
      </div>

      <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-10 border-t md:border-t-0 md:border-l border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Resumo do Pedido</h3>
        
        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between items-start text-sm">
              <div className="flex flex-col flex-1 pr-2">
                <span className="text-gray-800 font-bold">{item.nome}</span>
                
                {/* ATUALIZADO: Exibe a cor com a bolinha no resumo */}
                {item.cor_escolhida ? (
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.cor_hex || '#000' }} />
                    {item.cor_escolhida} ({item.quantidade || 1}x)
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 mt-1">({item.quantidade || 1}x)</span>
                )}
              </div>
              
              <span className="text-gray-900 font-bold whitespace-nowrap">
                R$ {(parsePreco(item.preco) * (item.quantidade || 1)).toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between items-center font-bold text-xl">
            <span>Total:</span>
            <span className="text-blue-600">R$ {totalCalculado.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <button form="checkout-form" type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors cursor-pointer disabled:bg-gray-400 shadow-lg shadow-green-600/20">
          {loading ? 'Processando...' : 'Confirmar e Pagar'}
        </button>
      </div>
    </div>
  );
}