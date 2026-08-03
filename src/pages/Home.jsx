import { useEffect, useState } from 'react';
import { Search, Rocket, ShieldCheck, CreditCard, Truck, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  const categorias = ['Todos', 'Decoração', 'Geek', 'Utilidades'];

  useEffect(() => {
    async function fetchProdutos() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProdutos(data || []);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  const produtosFiltrados = produtos.filter((produto) => {
    const combinaBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const combinaCategoria = categoriaAtiva === 'Todos' || produto.categoria === categoriaAtiva;
    return combinaBusca && combinaCategoria;
  });

  return (
    <div className="w-full flex flex-col gap-12 pb-12 animate-fade-in">
      
      {/* 1. HERO SECTION (BANNER PRINCIPAL) */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white rounded-[2rem] p-8 md:p-16 overflow-hidden shadow-2xl">
        {/* Efeito de brilho no fundo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
            <Sparkles size={14} className="text-amber-300" />
            <span>Nova Coleção Geek</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
            Impressão 3D de <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Alta Qualidade</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-xl leading-relaxed">
            Transformando suas ideias em realidade palpável. Peças exclusivas para decoração, setup gamer e utilidades do dia a dia.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => {
              document.getElementById('vitrine').scrollIntoView({ behavior: 'smooth' });
              setCategoriaAtiva('Geek');
            }} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer">
              Ver Coleção <ArrowRight size={18} />
            </button>
            <button onClick={() => document.getElementById('vitrine').scrollIntoView({ behavior: 'smooth' })} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-bold transition-all backdrop-blur-sm cursor-pointer">
              Explorar Tudo
            </button>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE BENEFÍCIOS (Confiança do Cliente) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 group hover:shadow-md transition-all">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-full group-hover:scale-110 transition-transform"><Truck size={24} /></div>
          <div><h4 className="font-bold text-slate-800 text-sm">Envio Nacional</h4><p className="text-xs text-slate-500">Para todo o Brasil</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 group hover:shadow-md transition-all">
          <div className="bg-green-50 text-green-600 p-3 rounded-full group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div>
          <div><h4 className="font-bold text-slate-800 text-sm">Compra Segura</h4><p className="text-xs text-slate-500">Proteção de dados</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 group hover:shadow-md transition-all">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-full group-hover:scale-110 transition-transform"><CreditCard size={24} /></div>
          <div><h4 className="font-bold text-slate-800 text-sm">Até 12x Sem Juros</h4><p className="text-xs text-slate-500">No cartão de crédito</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 group hover:shadow-md transition-all">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-full group-hover:scale-110 transition-transform"><Rocket size={24} /></div>
          <div><h4 className="font-bold text-slate-800 text-sm">Qualidade Premium</h4><p className="text-xs text-slate-500">Acabamento impecável</p></div>
        </div>
      </section>

      {/* 3. FILTROS E BUSCA */}
      <section id="vitrine" className="pt-4 scroll-mt-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <h2 className="text-2xl font-black text-slate-800">Nossa Vitrine</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Abas de Categoria estilo Pílula */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto custom-scrollbar">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setCategoriaAtiva(categoria)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    categoriaAtiva === categoria
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {categoria}
                </button>
              ))}
            </div>

            {/* Barra de Busca Refinada */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
              />
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            </div>
          </div>
        </div>

        {/* 4. GRID DE PRODUTOS */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Nenhum produto encontrado</h3>
            <p className="text-slate-500 mt-1">Tente buscar por outro termo ou limpe os filtros.</p>
            <button 
              onClick={() => { setBusca(''); setCategoriaAtiva('Todos'); }}
              className="mt-6 text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        )}
      </section>

      {/* 5. NEWSLETTER / CTA FINAL */}
      <section className="bg-blue-600 rounded-[2rem] p-8 md:p-12 text-center text-white mt-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4">Quer impressões sob medida?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Não encontrou o que procurava? Nós imprimimos a sua ideia! Faça um orçamento personalizado enviando o seu arquivo 3D.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-lg cursor-pointer">
            Fazer Orçamento Personalizado
          </button>
        </div>
      </section>

    </div>
  );
}