import { Link } from 'react-router-dom';
import { ShoppingCart, User, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { cart, setIsOpen } = useCartStore();
  const { user } = useAuthStore();
  
  // Conta o total de itens para a bolinha vermelha do carrinho no Desktop
  const totalItens = cart.reduce((acc, item) => acc + (item.quantidade || 1), 0);

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* justify-center no mobile, justify-between no PC */}
        <div className="flex items-center justify-center md:justify-between h-16">
          
          {/* LOGO TRIZD */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/LogoBranco.png" 
              alt="TrizD - Peças Impressas em 3D" 
              className="h-10 sm:h-12 object-contain filter drop-shadow-md" 
            />
          </Link>

          {/* MENU DESKTOP - Fica 100% invisível no celular (hidden md:flex) */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6 font-medium text-sm text-slate-300">
              <Link to="/" className="hover:text-white transition-colors">Início</Link>
              <button 
                onClick={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Catálogo
              </button>
            </div>

            <div className="flex items-center gap-4 border-l border-slate-700 pl-4">
              {/* Carrinho Desktop */}
              <button 
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ShoppingCart size={24} />
                {totalItens > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItens}
                  </span>
                )}
              </button>

              {/* Perfil Desktop */}
              <Link to={user ? "/perfil" : "/login"} className="p-2 text-slate-300 hover:text-white transition-colors">
                <User size={24} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}