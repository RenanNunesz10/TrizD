import { Link } from 'react-router-dom';

export default function ProductCard({ produto }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      <div className="h-56 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400 font-medium">
          [ Imagem {produto.id} ]
        </span>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="font-semibold text-gray-800 text-lg leading-tight mb-1">{produto.nome}</h4>
        <p className="text-blue-600 font-bold text-xl mt-2">{produto.preco}</p>
        
        {/* O Link substitui o button e joga para a URL do produto específico */}
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