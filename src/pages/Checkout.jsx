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

  const [formData, setFormData] = useState({
    nome: perfil?.nome || '', email: user?.email || '', endereco: '', cidade: '', cep: ''
  });

  useEffect(() => {
    if (perfil?.nome) setFormData((prev) => ({ ...prev, nome: perfil.nome }));
    if (user?.email) setFormData((prev) => ({ ...prev, email: user.email }));

    // Busca os endereços salvos do cliente
    async function fetchEnderecos() {
      if (!user) return;
      const { data } = await supabase.from('enderecos').select('*').eq('user_id', user.id);
      if (data) setEnderecosSalvos(data);
    }
    fetchEnderecos();
  }, [user, perfil]);

  const handleSelecionarEnderecoSalvo = (e) => {
    const enderecoId = e.target.value;
    if (!enderecoId) return;

    const selecionado = enderecosSalvos.find((end) => end.id === enderecoId);
    if (selecionado) {
      setFormData({
        ...formData,
        endereco: `${selecionado.rua}, ${selecionado.numero}${selecionado.complemento ? ' (' + selecionado.complemento + ')' : ''} - ${selecionado.bairro}`,
        cidade: selecionado.cidade,
        cep: selecionado.cep,
      });
      toast.success(`Endereço "${selecionado.titulo}" aplicado!`);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const parsePreco = (preco) => {
    if (typeof preco === 'number') return preco;
    const num = parseFloat(preco.replace('R$', '').replace('.', '').replace(',', '.').trim());
    return isNaN(num) ? 0 : num;
  };

  const totalCalculado = cart.reduce((acc, item) => acc + parsePreco(item.preco), 0);

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
      const enderecoCompleto = `${formData.endereco}, ${formData.cidade} - CEP: ${formData.cep}`;

      const { data: pedido, error: errorPedido } = await supabase
        .from('pedidos')
        .insert([{ user_id: user.id, status: 'Em Impressão 3D', total: totalCalculado, endereco_entrega: enderecoCompleto }])
        .select()
        .single();

      if (errorPedido) throw errorPedido;

      const itensParaInserir = cart.map((item) => ({
        pedido_id: pedido.id,
        nome_produto: item.nome,
        preco_unitario: parsePreco(item.preco),
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
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Voltar para a loja</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito 🔒</h2>
        <p className="text-gray-600 mb-6">Você precisa estar logado para acessar o pagamento.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Fazer Login</button>
          <button onClick={() => navigate('/cadastro')} className="bg-gray-100 text-gray-800 border border-gray-300 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition">Criar Conta</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
      <div className="w-full md:w-2/3 p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dados de Entrega</h2>

        {/* Seletor de Endereços Salvos */}
        {enderecosSalvos.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-bold text-blue-800 mb-2">Usar um Endereço Salvo:</label>
            <select onChange={handleSelecionarEnderecoSalvo} className="w-full p-2 border border-blue-300 rounded bg-white font-medium text-gray-700 outline-none">
              <option value="">-- Selecione para preencher automaticamente --</option>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua, Número, Bairro)</label>
            <input required type="text" name="endereco" value={formData.endereco} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade / Estado</label>
              <input required type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input required type="text" name="cep" value={formData.cep} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </form>
      </div>

      <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-10 border-t md:border-t-0 md:border-l border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Resumo do Pedido</h3>
        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate mr-4">{item.nome}</span>
              <span className="text-gray-900 font-medium whitespace-nowrap">{item.preco}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span className="text-blue-600">R$ {totalCalculado.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        <button form="checkout-form" type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors cursor-pointer disabled:bg-gray-400">
          {loading ? 'Processando...' : 'Confirmar e Pagar'}
        </button>
      </div>
    </div>
  );
}