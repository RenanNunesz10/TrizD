import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Busca e Categoria
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  useEffect(() => {
    async function fetchProdutos() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('produtos')
          .select('*');

        if (error) {
          console.error('Erro ao buscar produtos:', error);
        } else {
          setProdutos(data);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
  }, []);

  // Lista de Categorias dinâmicas
  const categorias = ['Todos', 'Decoração', 'Geek', 'Utilidades'];

  // Filtragem inteligente em tempo real (Busca + Categoria)
  const produtosFiltrados = produtos.filter((produto) => {
    const combinaNome = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const combinaCategoria = 
      categoriaAtiva === 'Todos' || produto.categoria === categoriaAtiva;

    return combinaNome && combinaCategoria;
  });

  return (
    <>
      <Hero />

      {/* Seção de Busca e Filtros */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Barra de Pesquisa */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Buscar produtos 3D..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        {/* Botões de Categorias */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              onClick={() => setCategoriaAtiva(categoria)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
                categoriaAtiva === categoria
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-6">Produtos em Destaque</h3>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          Carregando produtos...
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
          Nenhum produto encontrado para a sua busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtosFiltrados.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </>
  );
}