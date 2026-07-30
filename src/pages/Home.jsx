import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';

const produtosMock = [
  { id: 1, nome: 'Vaso Decorativo Low Poly', preco: 'R$ 45,00' },
  { id: 2, nome: 'Suporte para Headset', preco: 'R$ 60,00' },
  { id: 3, nome: 'Action Figure Customizado', preco: 'R$ 150,00' },
  { id: 4, nome: 'Vaso Groot 3D', preco: 'R$ 55,00' },
];

export default function Home() {
  return (
    <>
      <Hero />
      <h3 className="text-xl font-bold text-gray-800 mb-6">Produtos em Destaque</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {produtosMock.map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>
    </>
  );
}