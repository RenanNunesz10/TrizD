import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity } = useCartStore();

  const total = cart.reduce((acc, item) => acc + Number(item.preco) * item.quantidade, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Fundo escuro */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Cabeçalho */}
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-600" />
              <h2 className="text-lg font-black text-slate-800">Seu Carrinho</h2>
              <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <ShoppingBag size={48} className="mx-auto opacity-30" />
                <p className="font-bold text-slate-600">Seu carrinho está vazio</p>
                <p className="text-xs">Explore nossa vitrine e adicione peças incríveis.</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.id}-${item.cor_escolhida}-${index}`} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <img 
                    src={item.imagem_url || '/placeholder.png'} 
                    alt={item.nome} 
                    className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm truncate">{item.nome}</h4>
                      
                      {/* Bbadge da Cor Escolhida */}
                      {item.cor_escolhida && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span 
                            className="w-3 h-3 rounded-full border border-slate-300 shadow-sm inline-block" 
                            style={{ backgroundColor: item.cor_hex || '#000000' }}
                          />
                          <span className="text-xs text-slate-500 font-medium">
                            {item.cor_escolhida}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-blue-600 text-sm">
                        R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                      </span>

                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        <button 
                          onClick={() => updateQuantity(index, item.quantidade - 1)}
                          className="text-slate-400 hover:text-slate-700 font-bold px-1"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-800">{item.quantidade}</span>
                        <button 
                          onClick={() => updateQuantity(index, item.quantidade + 1)}
                          className="text-slate-400 hover:text-slate-700 font-bold px-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(index)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Rodapé com Total e Botão */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-black text-blue-600">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/checkout');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Finalizar Compra <ArrowRight size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}