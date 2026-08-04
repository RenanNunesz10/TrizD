import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { useAuthStore } from '../store/authStore';
import { useFavoritosStore } from '../store/favoritosStore';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ProductCard({ produto }) {
  const { user } = useAuthStore();
  const { favoritos, toggleFavorito } = useFavoritosStore();
  const navigate = useNavigate();

  // Estados para Média e Total de Avaliações
  const [mediaNotas, setMediaNotas] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

  const isFavorito = favoritos.includes(produto.id);

  // --- LÓGICA DE PROMOÇÃO ---
  const temOferta = produto.preco_promocional && Number(produto.preco_promocional) < Number(produto.preco);
  const precoEfetivo = temOferta ? Number(produto.preco_promocional) : Number(produto.preco);
  const porcentagemDesconto = temOferta 
    ? Math.round(((Number(produto.preco) - Number(produto.preco_promocional)) / Number(produto.preco)) * 100) 
    : 0;

  // Busca as avaliações deste produto no Supabase
  useEffect(() => {
    async function fetchAvaliacoes() {
      if (!produto?.nome) return;

      const { data, error } = await supabase
        .from('avaliacoes')
        .select('nota')
        .eq('nome_produto', produto.nome);

      if (!error && data && data.length > 0) {
        const soma = data.reduce((acc, item) => acc + item.nota, 0);
        const media = soma / data.length;
        setMediaNotas(media);
        setTotalAvaliacoes(data.length);
      }
    }

    fetchAvaliacoes();
  }, [produto]);

  const handleFavoritar = async () => {
    if (!user) {
      toast('Faça login para salvar seus favoritos!', { icon: '🔒' });
      navigate('/login');
      return;
    }
    await toggleFavorito(user.id, produto.id);
    toast.success(isFavorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos!');
  };

  const precoFormatado = `R$ ${precoEfetivo.toFixed(2).replace('.', ',')}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col relative group">
      
      {/* BADGE DE DESCONTO */}
      {temOferta && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
          -{porcentagemDesconto}%
        </span>
      )}

      {/* Botão de Favorito no topo direito */}
      <button 
        onClick={handleFavoritar}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer"
      >
        <Heart 
          size={20} 
          className={isFavorito ? "fill-red-500 text-red-500" : "text-gray-400"} 
        />
      </button>

      {/* Visualizador / Imagem */}
      <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        {produto.imagem_url?.endsWith('.glb') ? (
          <ModelViewer modelUrl={produto.imagem_url} />
        ) : produto.imagem_url ? (
          <img src={produto.imagem_url} alt={produto.nome} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-gray-400 font-medium">Sem imagem</span>
        )}
      </div>
      
      {/* Informações do Produto */}
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="font-semibold text-gray-800 text-lg leading-tight mb-1">{produto.nome}</h4>
        
        {/* Avaliações com Estrelas */}
        <div className="flex items-center gap-1.5 my-2">
          {totalAvaliacoes > 0 ? (
            <>
              <div className="flex items-center">
                <Star size={16} className="fill-amber-400 text-amber-400" />
              </div>
              <span className="text-sm font-bold text-gray-800">
                {mediaNotas.toFixed(1).replace('.', ',')}
              </span>
              <span className="text-xs text-gray-400">
                ({totalAvaliacoes} {totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Star size={14} className="text-gray-300" /> Sem avaliações
            </span>
          )}
        </div>

        {/* PREÇOS (DE / POR) */}
        <div className="mt-auto pt-2">
          {temOferta && (
            <span className="text-xs text-gray-400 line-through font-semibold block mb-0.5">
              R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
            </span>
          )}
          <p className={`${temOferta ? 'text-red-600' : 'text-blue-600'} font-bold text-xl`}>
            {precoFormatado}
          </p>
        </div>
        
        <Link 
          to={`/produto/${produto.id}`} 
          className="mt-4 block text-center bg-gray-50 border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 py-2 rounded font-medium transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}