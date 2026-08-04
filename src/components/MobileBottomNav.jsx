import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function MobileBottomNav() {
  const { cart, setIsOpen } = useCartStore();
  const { user } = useAuthStore();
  const location = useLocation();

  // Esconde a barra inferior se o usuário estiver no Painel Admin
  if (location.pathname.startsWith('/admin')) return null;

  const totalItens = cart.reduce((acc, item) => acc + (item.quantidade || 1), 0);

  // Função para saber em qual tela estamos e pintar o ícone de azul
  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex items-center justify-around py-2 pb-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      {/* Botão INÍCIO */}
      <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
        <Home size={24} />
        <span className="text-[10px] font-bold">Início</span>
      </Link>
      
      {/* Botão BUSCA (Rola para a vitrine) */}
      <button 
        onClick={() => {
          if(location.pathname !== '/') window.location.href = '/';
          setTimeout(() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}
        className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
      >
        <Search size={24} />
        <span className="text-[10px] font-bold">Busca</span>
      </button>

      {/* Botão CARRINHO (Abre a gaveta) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-600 transition-colors relative cursor-pointer"
      >
        <ShoppingCart size={24} />
        {totalItens > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {totalItens}
          </span>
        )}
        <span className="text-[10px] font-bold">Carrinho</span>
      </button>

      {/* Botão PERFIL */}
      <Link to={user ? "/perfil" : "/login"} className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/perfil') || isActive('/login') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
        <User size={24} />
        <span className="text-[10px] font-bold">Perfil</span>
      </Link>
      
    </div>
  );
}