import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // IMPORTAÇÃO NOVO
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import CartDrawer from './components/CartDrawer'; // IMPORTAÇÃO NOVO

export default function App() {
  return (
    <Router>
      {/* Componente dos avisos bonitos */}
      <Toaster position="bottom-right" />
      {/* A gaveta fica disponível em todas as telas */}
      <CartDrawer /> 
      
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:id" element={<ProductDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}