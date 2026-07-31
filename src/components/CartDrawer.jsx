import { X, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  

  return (
    <>
      {/* Fundo escuro que cobre a tela (Overlay) */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* A Gaveta em si */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">Seu Carrinho</h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              Seu carrinho está vazio.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.nome}</h4>
                    <p className="text-blue-600 font-medium">{item.preco}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <button 
              onClick={() => {
                closeCart(); // Fecha a gaveta primeiro
                
                if (!user) {
                  // Se não estiver logado, avisa e manda pro login
                  toast('Faça login ou crie uma conta para finalizar a compra.', { icon: '🔒' });
                  navigate('/login');
                } else {
                  // Se estiver logado, vai pro checkout normalmente
                  navigate('/checkout');
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors cursor-pointer"
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </>
  );
}