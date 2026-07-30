import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const { cart, openCart } = useCartStore();
  const [isMenuMobileOpen, setIsMenuMobileOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="z-50">
          <h1 className="text-2xl font-bold tracking-wider">
            3D<span className="text-blue-400">Store</span>
          </h1>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={openCart}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-md font-semibold transition-colors"
          >
            <ShoppingCart size={20} />
            Carrinho ({cart.length})
          </button>
        </div>

        {/* Botão Mobile (Hambúrguer) */}
        <button 
          className="md:hidden z-50 p-2"
          onClick={() => setIsMenuMobileOpen(!isMenuMobileOpen)}
        >
          {isMenuMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Dropdown Menu Mobile */}
      {isMenuMobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-800 border-t border-gray-700 py-4 px-4 flex flex-col gap-4 shadow-xl">
          <button 
            onClick={() => {
              openCart();
              setIsMenuMobileOpen(false);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-md font-semibold transition-colors w-full"
          >
            <ShoppingCart size={20} />
            Ver Carrinho ({cart.length})
          </button>
        </div>
      )}
    </header>
  );
}