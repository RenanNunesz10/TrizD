export default function Cart() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Seu Carrinho</h2>
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">Seu carrinho está vazio no momento.</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors">
          Continuar Comprando
        </button>
      </div>
    </div>
  );
}