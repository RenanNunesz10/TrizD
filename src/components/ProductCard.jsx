export default function ProductCard({ produto }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <div className="h-56 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400 font-medium">
          [ Imagem {produto.id} ]
        </span>
      </div>
      <div className="p-5">
        <h4 className="font-semibold text-gray-800 text-lg leading-tight mb-1">{produto.nome}</h4>
        <p className="text-blue-600 font-bold text-xl mt-2">{produto.preco}</p>
        <button className="w-full mt-4 bg-gray-50 border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 py-2 rounded font-medium transition-colors">
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}