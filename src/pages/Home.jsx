import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        setLoading(true);
        // Busca todas as linhas da tabela 'produtos'
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

  return (
    <>
      <Hero />
      <h3 className="text-xl font-bold text-gray-800 mb-6">Produtos em Destaque</h3>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          Carregando produtos do banco de dados...
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum produto cadastrado no banco de dados ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </>
  );
}