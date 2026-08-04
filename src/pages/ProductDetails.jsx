import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Truck, ShieldCheck, ShoppingCart, Plus, Sparkles, Minus, ChevronRight, Package, ArrowLeft, Ruler, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useCartStore } from '../store/cartStore';
import ModelViewer from '../components/ModelViewer';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [filamentos, setFilamentos] = useState([]);
  const [corSelecionada, setCorSelecionada] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [cep, setCep] = useState('');
  const [produtosRelacionados, setProdutosRelacionados] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const { data: dataProd, error: erroProd } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', id)
          .single();

        if (erroProd) throw erroProd;
        setProduto(dataProd);

        const { data: dataFilamentos } = await supabase
          .from('estoque_filamentos')
          .select('*')
          .gt('peso_atual', 50);

        setFilamentos(dataFilamentos || []);
        if (dataFilamentos && dataFilamentos.length > 0) {
          setCorSelecionada(dataFilamentos[0]); 
        }

        const { data: dataAvaliacoes } = await supabase
          .from('avaliacoes')
          .select('*')
          .eq('nome_produto', dataProd.nome)
          .order('created_at', { ascending: false });
          
        setAvaliacoes(dataAvaliacoes || []);

        if (dataProd.categoria) {
          const { data: dataRelacionados } = await supabase
            .from('produtos')
            .select('*')
            .eq('categoria', dataProd.categoria)
            .neq('id', dataProd.id)
            .limit(4);
            
          setProdutosRelacionados(dataRelacionados || []);
        }

      } catch (error) {
        toast.error('Produto não encontrado.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    window.scrollTo(0, 0);
    fetchData();
  }, [id, navigate]);

  // 🛑 PROTEÇÃO: Mostra o Loading ANTES de tentar fazer qualquer cálculo
  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 🛑 PROTEÇÃO: Se por acaso o produto não existir, encerra aqui
  if (!produto) return null;

  // ✅ AGORA É SEGURO: A matemática só roda depois que temos certeza que 'produto' tem dados
  const temOferta = produto.preco_promocional && Number(produto.preco_promocional) < Number(produto.preco);
  const precoEfetivo = temOferta ? Number(produto.preco_promocional) : Number(produto.preco);
  const porcentagemDesconto = temOferta 
    ? Math.round(((Number(produto.preco) - Number(produto.preco_promocional)) / Number(produto.preco)) * 100) 
    : 0;

  const mediaNotas = avaliacoes.length > 0 
    ? avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length 
    : 0;

  const handleComprar = () => {
    const produtoPersonalizado = {
      ...produto,
      preco: precoEfetivo,
      cor_escolhida: corSelecionada?.nome || 'Padrão',
      cor_hex: corSelecionada?.cor || '#000000'
    };
    
    for (let i = 0; i < quantidade; i++) {
      addToCart(produtoPersonalizado);
    }
    
    toast.success('Adicionado ao carrinho com sucesso!');
  };

  const simularFrete = () => {
    if (cep.length < 8) return toast.error('Digite um CEP válido');
    toast.success('Frete grátis liberado para sua região!', { icon: '🚚' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-16 px-4 sm:px-6">
      
      <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium pt-8">
        <Link to="/" className="hover:text-blue-600 flex items-center gap-1"><ArrowLeft size={16}/> Voltar</Link>
        <ChevronRight size={14} />
        <Link to="/" className="hover:text-blue-600">{produto.categoria || 'Catálogo'}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-bold truncate">{produto.nome}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden sticky top-32 relative">
          
          {temOferta && (
            <span className="absolute top-4 left-4 z-10 bg-red-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md animate-pulse flex items-center gap-1">
              <Tag size={14}/> {porcentagemDesconto}% OFF
            </span>
          )}

          <div className="aspect-square bg-slate-50 flex items-center justify-center p-8">
            {produto.imagem_url?.endsWith('.glb') ? (
              <div className="w-full h-full cursor-move">
                <ModelViewer modelUrl={produto.imagem_url} />
              </div>
            ) : produto.imagem_url ? (
              <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <Package size={64} className="mb-4 opacity-20" />
                <span className="font-medium text-lg">Imagem Indisponível</span>
              </div>
            )}
          </div>
          <div className="bg-blue-50/50 p-4 text-center border-t border-blue-100/50">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles size={14}/> Produto Premium 3D
            </p>
          </div>
        </div>

        <div className="space-y-8">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                {produto.categoria || 'Geral'}
              </span>
              <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                <ShieldCheck size={16}/> Pronta Produção
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight">
              {produto.nome}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={18} 
                    className={star <= Math.round(mediaNotas) ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">{mediaNotas.toFixed(1).replace('.', ',')}</span>
              <span className="text-sm text-slate-400">({avaliacoes.length} avaliações)</span>
            </div>
          </div>

          <div className="py-6 border-y border-slate-100">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
              {temOferta ? 'OFERTA ESPECIAL' : 'Preço Especial'}
            </p>
            <div className="flex items-end gap-3 flex-wrap">
              {temOferta && (
                <span className="text-2xl font-bold text-slate-400 line-through mb-1">
                  R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                </span>
              )}
              <h2 className={`text-5xl font-black ${temOferta ? 'text-red-600' : 'text-blue-600'}`}>
                R$ {precoEfetivo.toFixed(2).replace('.', ',')}
              </h2>
              <p className="text-slate-500 font-medium mb-1.5">no PIX ou 12x no cartão</p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed text-lg">
            {produto.descricao || 'Peça produzida sob demanda com polímeros de alta resistência e excelente acabamento.'}
          </p>

          {filamentos.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cor do Material</label>
                <span className="text-xs font-bold text-blue-600">{corSelecionada?.nome}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {filamentos.map((fil) => (
                  <button
                    key={fil.id}
                    onClick={() => setCorSelecionada(fil)}
                    className={`w-12 h-12 rounded-full border-2 transition-all cursor-pointer ${
                      corSelecionada?.id === fil.id 
                        ? 'border-blue-600 scale-110 shadow-md ring-4 ring-blue-100' 
                        : 'border-transparent shadow-sm hover:scale-105'
                    }`}
                    style={{ backgroundColor: fil.cor }}
                    title={fil.nome}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-2 w-full sm:w-40 h-14">
              <button 
                onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all cursor-pointer"
              >
                <Minus size={20} />
              </button>
              <span className="font-black text-lg text-slate-800">{quantidade}</span>
              <button 
                onClick={() => setQuantidade(quantidade + 1)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </div>

            <button 
              onClick={handleComprar}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
            >
              <ShoppingCart size={24} /> Adicionar ao Carrinho
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Truck size={18} className="text-blue-600"/> Calcular Frete e Prazo</h4>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="00000-000" 
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button onClick={simularFrete} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-colors">
                Calcular
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-600">
              <Ruler className="text-slate-400" size={24}/>
              <div className="text-sm"><p className="font-bold text-slate-800">Tamanho Real</p><p className="text-xs">Escala 1:1</p></div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <ShieldCheck className="text-slate-400" size={24}/>
              <div className="text-sm"><p className="font-bold text-slate-800">Garantia</p><p className="text-xs">Contra defeitos</p></div>
            </div>
          </div>

        </div>
      </div>

      <hr className="border-slate-200 my-16" />

      <section className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <Star className="text-amber-400 fill-amber-400" size={28}/> Avaliações dos Clientes
        </h3>

        {avaliacoes.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center">
            <Star size={48} className="mx-auto text-slate-300 mb-4" />
            <h4 className="text-lg font-bold text-slate-700">Seja o primeiro a avaliar!</h4>
            <p className="text-slate-500 mt-2">Compre este produto e conte para nós o que achou da qualidade da impressão.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {avaliacoes.map((av) => (
              <div key={av.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6">
                <div className="sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 pr-4">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className={star <= av.nota ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-slate-800">Cliente Verificado</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(av.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 italic leading-relaxed">"{av.comentario || 'Produto excelente, super recomendo!'}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {produtosRelacionados.length > 0 && (
        <section className="pt-16 mt-16 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Package className="text-blue-600"/> Você também pode gostar
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtosRelacionados.map((prod) => (
              <ProductCard key={prod.id} produto={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}