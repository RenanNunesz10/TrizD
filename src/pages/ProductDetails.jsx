import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCartStore } from '../store/cartStore';

export default function ProductDetails() {
  const { id } = useParams(); // Pega o ID passado na URL
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);

  // Puxa a função de adicionar ao carrinho do Zustand
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    async function fetchProduto() {
      try {
        setLoading(true);
        // Busca apenas o produto onde o 'id' é igual ao 'id' da URL
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', id)
          .single(); // .single() garante que retorna um único objeto em vez de uma lista

        if (error) {
          console.error('Erro ao buscar produto:', error);
        } else {
          setProduto(data);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduto();
  }, [id]);

  const handleAddToCart = () => {
    if (produto) {
      // Adiciona o produto real (com dados do Supabase) ao carrinho
      addToCart({
        id: produto.id,
        nome: produto.nome,
        preco: typeof produto.preco === 'number' 
          ? `R$ ${produto.preco.toFixed(2).replace('.', ',')}` 
          : produto.preco,
        imagem_url: produto.imagem_url
      });

      alert(`${produto.nome} foi adicionado ao carrinho!`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Carregando detalhes do produto...
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produto não encontrado!</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-12 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-8">
      {/* Área do Visualizador 3D (ou Imagem por enquanto) */}
      <div className="w-full md:w-1/2 h-80 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200 overflow-hidden">
        {produto.imagem_url ? (
          <img 
            src={produto.imagem_url} 
            alt={produto.nome} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <span className="text-gray-400 font-medium">[ Visualizador 3D Aqui ]</span>
        )}
      </div>
      
      {/* Informações Reais do Produto */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{produto.nome}</h2>
        
        <p className="text-2xl text-blue-600 font-bold mb-6">
          {typeof produto.preco === 'number'
            ? `R$ ${produto.preco.toFixed(2).replace('.', ',')}`
            : produto.preco}
        </p>

        <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
          {produto.descricao || 'Sem descrição cadastrada para este produto.'}
        </p>

        <button 
          onClick={handleAddToCart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}