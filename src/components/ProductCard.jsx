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

  const [mediaNotas, setMediaNotas] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

  const isFavorito = favoritos.includes(produto.id);

  const temOferta = produto.preco_promocional && Number(produto.preco_promocional) < Number(produto.preco);
  const precoEfetivo = temOferta ? Number(produto.preco_promocional) : Number(produto.preco);
  const porcentagemDesconto = temOferta 
    ? Math.round(((Number(produto.preco) - Number(produto.preco_promocional)) / Number(produto.preco)) * 100) 
    : 0;

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
      
      {/* BADGE DE DESCONTO - Menor no mobile */}
      {temOferta && (
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-red-500 text-white font-black text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md">
          -{porcentagemDesconto}%
        </span>
      )}

      {/* Botão de Favorito - Menor no mobile */}
      <button 
        onClick={handleFavoritar}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer"
      >
        <Heart 
          size={16} 
          className={`sm:w-5 sm:h-5 ${isFavorito ? "fill-red-500 text-red-500" : "text-gray-400"}`} 
        />
      </button>

      {/* Visualizador / Imagem - Altura ajustada: h-36 no celular, h-56 no PC */}
      <div className="h-36 sm:h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        {produto.imagem_url?.endsWith('.glb') ? (
          <ModelViewer modelUrl={produto.imagem_url} />
        ) : produto.imagem_url ? (
          <img src={produto.imagem_url} alt={produto.nome} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-gray-400 font-medium text-xs sm:text-base">Sem imagem</span>
        )}
      </div>
      
      {/* Informações do Produto - Paddings mais justos (p-3) no celular */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        <h4 className="font-semibold text-gray-800 text-sm sm:text-lg leading-tight mb-1 line-clamp-2 sm:line-clamp-1">{produto.nome}</h4>
        
        {/* Avaliações - Esconde o texto longo no celular, deixa só a nota */}
        <div className="flex items-center gap-1.5 my-1 sm:my-2">
          {totalAvaliacoes > 0 ? (
            <>
              <div className="flex items-center">
                <Star size={12} className="sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                {mediaNotas.toFixed(1).replace('.', ',')}
              </span>
              <span className="hidden sm:inline text-xs text-gray-400">
                ({totalAvaliacoes} avaliações)
              </span>
            </>
          ) : (
            <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
              <Star size={10} className="sm:w-[14px] sm:h-[14px] text-gray-300" /> Sem avaliações
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          {temOferta && (
            <span className="text-[10px] sm:text-xs text-gray-400 line-through font-semibold block mb-0.5">
              R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
            </span>
          )}
          <p className={`${temOferta ? 'text-red-600' : 'text-blue-600'} font-bold text-base sm:text-xl`}>
            {precoFormatado}
          </p>
        </div>
        
        <Link 
          to={`/produto/${produto.id}`} 
          className="mt-3 sm:mt-4 block text-center bg-gray-50 border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 py-1.5 sm:py-2 rounded text-xs sm:text-base font-medium transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}