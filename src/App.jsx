import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react'; // <-- NOVO: Importamos o useEffect
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import CartDrawer from './components/CartDrawer';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';
import Pedidos from './pages/admin/Pedidos';
import AnnouncementBar from './components/AnnouncementBar';
import Promocoes from './pages/admin/Promocoes';

// --- NOVO: Importamos o nosso gerenciador de autenticação ---
import { useAuthStore } from './store/authStore'; 

// Importações do Admin
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Estoque from './pages/admin/Estoque';
import Produtos from './pages/admin/Produtos';
import Calculadora from './pages/admin/Calculadora';

// Layout para a Loja
function StoreLayout() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Outlet />
    </div>
  );
}

function App() {
  const { checkUser } = useAuthStore(); 

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        
        {/* === NOSSA NOVA BARRA AQUI === */}
        <AnnouncementBar />
        
        <Navbar />

        <main className="flex-grow w-full">
          <Routes>
            
            {/* ROTAS DA LOJA */}
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/produto/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>

            {/* ROTAS DO ADMIN */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="promocoes" element={<Promocoes />} />
              <Route path="estoque" element={<Estoque />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="calculadora" element={<Calculadora />} />
            </Route>

          </Routes>
        </main>
        <CartDrawer />
      </div>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;