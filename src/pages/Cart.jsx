import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Seu Carrinho</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Seu carrinho está vazio no momento.</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors">
            Continuar Comprando
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-4">
              <div>
                <h4 className="font-semibold text-gray-800">{item.nome}</h4>
                <p className="text-gray-600">{item.preco}</p>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Remover
              </button>
            </div>
          ))}
          
          <div className="mt-6 text-right">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Finalizar Compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}