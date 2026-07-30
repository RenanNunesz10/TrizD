import { useParams } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function ProductDetails() {
  // Pega o ID da URL (ex: /produto/2 -> id = 2)
  const { id } = useParams();
  
  // Puxa a função de adicionar da nossa store
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = () => {
    // Simulando os dados do produto que está sendo comprado
    const produtoSimulado = {
      id: id,
      nome: `Produto 3D Exclusivo (Ref: ${id})`,
      preco: 'R$ 50,00'
    };
    
    addToCart(produtoSimulado);
    alert('Produto adicionado ao carrinho com sucesso!');
  };

  return (
    <div className="bg-white p-6 md:p-12 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2 h-80 bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-500 font-bold text-xl">[ Visualizador 3D Aqui ]</span>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Produto 3D Exclusivo (Ref: {id})</h2>
        <p className="text-2xl text-blue-600 font-bold mb-6">R$ 50,00</p>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Descrição detalhada do produto. Material de alta qualidade, resistente e com acabamento perfeito.
        </p>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}