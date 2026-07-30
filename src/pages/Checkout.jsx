import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '', email: '', endereco: '', cidade: '', cep: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalizarPedido = (e) => {
    e.preventDefault(); // Impede a página de recarregar

    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }

    // Aqui no futuro entrará a integração com Stripe/Mercado Pago ou o salvamento no banco de dados (Supabase)
    
    toast.success('Pedido realizado com sucesso! 🎉', { duration: 4000 });
    clearCart();
    navigate('/'); // Manda o cliente de volta pra Home
  };

  // Se o carrinho estiver vazio, avisa o usuário (caso ele acesse a URL direto)
  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu carrinho está vazio</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
          Voltar para a loja
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
      
      {/* Coluna Esquerda: Formulário de Entrega */}
      <div className="w-full md:w-2/3 p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dados de Entrega</h2>
        <form id="checkout-form" onSubmit={handleFinalizarPedido} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input required type="text" name="nome" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input required type="email" name="email" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua, Número, Complemento)</label>
            <input required type="text" name="endereco" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade / Estado</label>
              <input required type="text" name="cidade" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input required type="text" name="cep" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </form>
      </div>

      {/* Coluna Direita: Resumo do Pedido */}
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
            {/* Como os preços estão como string "R$ 45,00", o cálculo real fica pro backend. Por hora, apenas mostramos a quantidade. */}
            <span className="text-blue-600">{cart.length} itens</span>
          </div>
        </div>

        <button 
          form="checkout-form" 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors cursor-pointer"
        >
          Confirmar Pedido
        </button>
      </div>

    </div>
  );
}