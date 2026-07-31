import { useEffect } from 'react'; // IMPORTAÇÃO NOVA
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import CartDrawer from './components/CartDrawer';
import { useAuthStore } from './store/authStore';
import Profile from './pages/Profile';

export default function App() {
  // Puxa a função que checa o login
  const checkUser = useAuthStore((state) => state.checkUser);

  // Roda uma única vez quando o site abre
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return (
    <Router>
      <Toaster position="bottom-right" />
      <CartDrawer /> 
      
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perfil" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}