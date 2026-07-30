export default function ProductDetails() {
  return (
    <div className="bg-white p-6 md:p-12 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-8">
      {/* Área reservada para o 3D depois */}
      <div className="w-full md:w-1/2 h-80 bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-500 font-bold text-xl">[ Visualizador 3D Aqui ]</span>
      </div>
      
      {/* Informações */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Nome do Produto 3D</h2>
        <p className="text-2xl text-blue-600 font-bold mb-6">R$ 00,00</p>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Descrição detalhada do produto. Aqui você vai explicar o material usado na impressão 3D (ex: PLA ou Resina), o tamanho da peça e os cuidados necessários.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}