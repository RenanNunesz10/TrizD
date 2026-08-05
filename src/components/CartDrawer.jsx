import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity } = useCartStore();

  const total = cart.reduce((acc, item) => acc + Number(item.preco) * item.quantidade, 0);

  if (!isOpen) return null;

  return (
    // 1. Container principal: Ocupa a tela inteira e empurra o conteúdo para a direita (justify-end)
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden animate-fade-in">
      
      {/* 2. Fundo escuro (Overlay) */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* 3. A Gaveta: w-full e h-full (100%) no celular, mas max-w-md (448px) no PC */}
      <div className="relative w-full h-full md:max-w-md bg-white shadow-2xl flex flex-col">
        
        {/* Cabeçalho */}
        <div className="p-5 md:p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
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
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <ShoppingBag size={48} className="mx-auto text-slate-200" />
              <p className="font-bold text-slate-600">Seu carrinho está vazio</p>
              <p className="text-xs text-slate-400">Explore nossa vitrine e adicione peças incríveis.</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.id}-${item.cor_escolhida}-${index}`} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 relative group">
                <img 
                  src={item.imagem_url || '/placeholder.png'} 
                  alt={item.nome} 
                  className="w-20 h-20 sm:w-16 sm:h-16 object-contain rounded-xl bg-white p-1 border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{item.nome}</h4>
                    
                    {item.cor_escolhida && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span 
                          className="w-3 h-3 rounded-full border border-slate-300 shadow-sm inline-block" 
                          style={{ backgroundColor: item.cor_hex || '#000000' }}
                        />
                        <span className="text-xs text-slate-500 font-medium truncate">
                          {item.cor_escolhida}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-blue-600 text-sm sm:text-base">
                      R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                    </span>

                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      <button 
                        onClick={() => updateQuantity(index, item.quantidade - 1)}
                        className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-slate-800 w-4 text-center">{item.quantidade}</span>
                      <button 
                        onClick={() => updateQuantity(index, item.quantidade + 1)}
                        className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => removeFromCart(index)}
                  className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-red-500 p-1.5 rounded-full border border-slate-100 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remover Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé com Total e Botão - mantendo o pb-24 pro celular */}
        {cart.length > 0 && (
          <div className="shrink-0 p-5 md:p-6 pb-24 md:pb-6 bg-white border-t border-slate-100 space-y-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
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
  );
}