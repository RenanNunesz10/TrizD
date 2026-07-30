export default function Navbar() {
  return (
    <header className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wider cursor-pointer">
          3D<span className="text-blue-400">Store</span>
        </h1>
        <button className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-md font-semibold transition-colors">
          Carrinho (0)
        </button>
      </div>
    </header>
  );
}