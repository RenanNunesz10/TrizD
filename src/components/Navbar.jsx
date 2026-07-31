import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore'; // IMPORTAÇÃO NOVA

export default function Navbar() {
  const { cart, openCart } = useCartStore();
  const { user, perfil, logout } = useAuthStore(); // Puxa os dados do usuário
  const [isMenuMobileOpen, setIsMenuMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        
        <Link to="/" className="z-50">
          <h1 className="text-2xl font-bold tracking-wider">
            3D<span className="text-blue-400">Store</span>
          </h1>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* Área de Autenticação */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">
                Olá, {perfil?.nome || 'Usuário'}
              </span>
              
              {/* Botão Dinâmico: Admin vai pro Painel, Cliente vai pros Pedidos */}
              {perfil?.role === 'admin' ? (
                <Link to="/admin" className="hover:text-blue-400 transition-colors">Painel Admin</Link>
              ) : (
                <Link to="/perfil" className="hover:text-blue-400 transition-colors">Meus Pedidos</Link>
              )}

              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <User size={20} />
              Entrar
            </Link>
          )}

          <button 
            onClick={openCart}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-md font-semibold transition-colors"
          >
            <ShoppingCart size={20} />
            Carrinho ({cart.length})
          </button>
        </div>

        {/* Botão Mobile */}
        <button 
          className="md:hidden z-50 p-2"
          onClick={() => setIsMenuMobileOpen(!isMenuMobileOpen)}
        >
          {isMenuMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Dropdown Mobile (Simplificado) */}
      {isMenuMobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-800 border-t border-gray-700 py-4 px-4 flex flex-col gap-4 shadow-xl">
          {!user && (
            <Link to="/login" onClick={() => setIsMenuMobileOpen(false)} className="text-center font-medium">
              Entrar na Conta
            </Link>
          )}
          <button 
            onClick={() => { openCart(); setIsMenuMobileOpen(false); }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-md font-semibold w-full"
          >
            <ShoppingCart size={20} /> Carrinho ({cart.length})
          </button>
        </div>
      )}
    </header>
  );
}