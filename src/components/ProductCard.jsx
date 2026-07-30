import { Link } from 'react-router-dom';
import ModelViewer from './ModelViewer';

export default function ProductCard({ produto }) {
  // Formata o preço corretamente para a Home também
  const precoFormatado = typeof produto.preco === 'number'
    ? `R$ ${produto.preco.toFixed(2).replace('.', ',')}`
    : produto.preco;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      
      {/* Área da imagem ou 3D na Home */}
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