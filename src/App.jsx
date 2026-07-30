import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        
        {/* Navbar aparece em todas as páginas */}
        <Navbar />

        {/* O "miolo" muda dependendo da URL */}
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:id" element={<ProductDetails />} />
            <Route path="/carrinho" element={<Cart />} />
          </Routes>
        </main>

        {/* Footer aparece em todas as páginas */}
        <Footer />
        
      </div>
    </Router>
  );
}