import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { useAuthStore } from '../store/authStore';
import { useFavoritosStore } from '../store/favoritosStore';
import toast from 'react-hot-toast';

export default function ProductCard({ produto }) {
  const { user } = useAuthStore();
  const { favoritos, toggleFavorito } = useFavoritosStore();
  const navigate = useNavigate();

  // Verifica se o ID deste produto está na lista de favoritos
  const isFavorito = favoritos.includes(produto.id);

  const handleFavoritar = async () => {
    if (!user) {
      toast('Faça login para salvar seus favoritos!', { icon: '🔒' });
      navigate('/login');
      return;
    }
    await toggleFavorito(user.id, produto.id);
    toast.success(isFavorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos!');
  };

  const precoFormatado = typeof produto.preco === 'number'
    ? `R$ ${produto.preco.toFixed(2).replace('.', ',')}`
    : produto.preco;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col relative">
      
      {/* Botão de Favorito no topo direito */}
      <button 
        onClick={handleFavoritar}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors"
      >
        <Heart 
          size={20} 
          className={isFavorito ? "fill-red-500 text-red-500" : "text-gray-400"} 
        />
      </button>

      <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        {produto.imagem_url?.endsWith('.glb') ? (
          <ModelViewer modelUrl={produto.imagem_url} />
        ) : produto.imagem_url ? (
          <img src={produto.imagem_url} alt={produto.nome} className="h-full w-full object-cover" />
        ) : (
          <span className="text-gray-400 font-medium">Sem imagem</span>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="font-semibold text-gray-800 text-lg leading-tight mb-1">{produto.nome}</h4>
        <p className="text-blue-600 font-bold text-xl mt-2">{precoFormatado}</p>
        
        <Link 
          to={`/produto/${produto.id}`} 
          className="mt-auto pt-4 block text-center bg-gray-50 border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 py-2 rounded font-medium transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}