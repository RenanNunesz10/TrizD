import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Printer, CheckCircle2, Clock, Search, Send, RefreshCw, ShieldAlert, DollarSign, Users, TrendingUp, Plus, Pencil, Trash2, Box, Calculator, Zap, Settings, Tag, X, Database, PlusCircle, MinusCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, perfil, carregando } = useAuthStore();
  const navigate = useNavigate();

  // Controle de Abas
  const [abaAtiva, setAbaAtiva] = useState('pedidos');
  
  // Estados de Pedidos
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  // Estados de Produtos
  const [produtos, setProdutos] = useState([]);
  const [editandoProduto, setEditandoProduto] = useState(null);
  const [formProduto, setFormProduto] = useState({
    nome: '', preco: '', imagem_url: '', descricao: '', categoria: 'Decoração', estoque: 0
  });

  // Estados de Estoque (Filamentos)
  const [filamentos, setFilamentos] = useState([]);
  const [editandoFilamento, setEditandoFilamento] = useState(null);
  const [formFilamento, setFormFilamento] = useState({
    nome: '', cor: '#000000', peso_atual: 1000, peso_total: 1000
  });

  // Dashboard & Rastreio
  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [maisVendidos, setMaisVendidos] = useState([]);
  const [codigosRastreio, setCodigosRastreio] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);

  // Estados Calculadora
  const [calcPeso, setCalcPeso] = useState(50); 
  const [calcPrecoMaterial, setCalcPrecoMaterial] = useState(120); 
  const [calcTempo, setCalcTempo] = useState(4); 
  const [calcEnergia, setCalcEnergia] = useState(0.95); 
  const [calcPotencia, setCalcPotencia] = useState(150); 
  const [calcDesgaste, setCalcDesgaste] = useState(1.50); 
  const [calcMargem, setCalcMargem] = useState(150); 

  const custoMaterial = (calcPrecoMaterial / 1000) * calcPeso;
  const consumoKwh = (calcPotencia / 1000) * calcTempo;
  const custoEnergia = consumoKwh * calcEnergia;
  const custoMaquina = calcDesgaste * calcTempo;
  const custoTotal = custoMaterial + custoEnergia + custoMaquina;
  const precoSugerido = custoTotal * (1 + (calcMargem / 100));
  const lucroReal = precoSugerido - custoTotal;

  const listaStatus = ['Aguardando Pagamento', 'Em Impressão 3D', 'Acabamento & Pintura', 'Enviado', 'Entregue'];
  const categorias = ['Decoração', 'Geek', 'Utilidades'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: dPedidos } = await supabase.from('pedidos').select('*, itens_pedido(*)').order('created_at', { ascending: false });
      setPedidos(dPedidos || []);

      const { data: dProdutos } = await supabase.from('produtos').select('*').order('nome');
      setProdutos(dProdutos || []);

      const { data: dFilamentos } = await supabase.from('estoque_filamentos').select('*').order('created_at', { ascending: false });
      setFilamentos(dFilamentos || []);

      const { count } = await supabase.from('perfis').select('*', { count: 'exact', head: true }).eq('role', 'cliente');
      setTotalClientes(count || 0);

      const hoje = new Date();
      let faturamento = 0; let pendentes = 0; const contagemProd = {}; const rastreios = {};

      dPedidos?.forEach(p => {
        rastreios[p.id] = p.codigo_rastreio || '';
        if (new Date(p.created_at).getMonth() === hoje.getMonth()) faturamento += Number(p.total);
        if (['Aguardando Pagamento', 'Em Impressão 3D', 'Acabamento & Pintura'].includes(p.status)) pendentes++;
        p.itens_pedido?.forEach(i => contagemProd[i.nome_produto] = (contagemProd[i.nome_produto] || 0) + 1);
      });

      setFaturamentoMes(faturamento);
      setPedidosPendentes(pendentes);
      setCodigosRastreio(rastreios);
      setMaisVendidos(Object.entries(contagemProd).sort((a,b) => b[1]-a[1]).slice(0, 3));
    } catch (err) {
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!carregando && user && perfil?.role === 'admin') fetchData();
  }, [user, perfil, carregando]);

  // --- CONTROLE DE PRODUTOS ---
  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setSalvandoId('produto');
    const dadosParaSalvar = { ...formProduto, preco: Number(formProduto.preco), estoque: Number(formProduto.estoque) };

    try {
      if (editandoProduto) {
        await supabase.from('produtos').update(dadosParaSalvar).eq('id', editandoProduto.id);
        toast.success('Produto atualizado!');
      } else {
        await supabase.from('produtos').insert([dadosParaSalvar]);
        toast.success('Produto cadastrado!');
      }
      setFormProduto({ nome: '', preco: '', imagem_url: '', descricao: '', categoria: 'Decoração', estoque: 0 });
      setEditandoProduto(null);
      fetchData();
    } catch (err) {
      toast.error('Erro ao salvar produto.');
    } finally {
      setSalvandoId(null);
    }
  };

  const handleExcluirProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await supabase.from('produtos').delete().eq('id', id);
      toast.success('Produto removido!');
      fetchData();
    } catch (err) {
      toast.error('Erro ao excluir.');
    }
  };

  const prepararEdicao = (p) => {
    setEditandoProduto(p);
    setFormProduto({ nome: p.nome, preco: p.preco, imagem_url: p.imagem_url || '', descricao: p.descricao || '', categoria: p.categoria || 'Decoração', estoque: p.estoque || 0 });
    setAbaAtiva('produtos');
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  // --- CONTROLE DE FILAMENTOS E ESTOQUE ---
  const handleSalvarFilamento = async (e) => {
    e.preventDefault();
    setSalvandoId('filamento');
    const dados = { ...formFilamento, peso_atual: Number(formFilamento.peso_atual), peso_total: Number(formFilamento.peso_total) };
    
    try {
      if (editandoFilamento) {
        await supabase.from('estoque_filamentos').update(dados).eq('id', editandoFilamento.id);
        toast.success('Material atualizado!');
      } else {
        await supabase.from('estoque_filamentos').insert([dados]);
        toast.success('Material adicionado!');
      }
      setFormFilamento({ nome: '', cor: '#000000', peso_atual: 1000, peso_total: 1000 });
      setEditandoFilamento(null);
      fetchData();
    } catch (err) {
      toast.error('Erro ao salvar material.');
    } finally {
      setSalvandoId(null);
    }
  };

  const handleExcluirFilamento = async (id) => {
    if (!window.confirm('Deseja excluir este material do estoque?')) return;
    try {
      await supabase.from('estoque_filamentos').delete().eq('id', id);
      toast.success('Material removido!');
      fetchData();
    } catch (err) {
      toast.error('Erro ao remover material.');
    }
  };

  const alterarEstoqueProduto = async (produto, incremento) => {
    const novoEstoque = Math.max(0, (produto.estoque || 0) + incremento);
    try {
      await supabase.from('produtos').update({ estoque: novoEstoque }).eq('id', produto.id);
      setProdutos(produtos.map(p => p.id === produto.id ? { ...p, estoque: novoEstoque } : p));
    } catch (err) {
      toast.error('Erro ao atualizar estoque.');
    }
  };

  // --- CONTROLE DE PEDIDOS ---
  const handleAlterarStatus = async (id, status) => {
    const { error } = await supabase.from('pedidos').update({ status }).eq('id', id);
    if (!error) { 
      toast.success('Status atualizado!'); 
      fetchData();
      if (pedidoSelecionado && pedidoSelecionado.id === id) setPedidoSelecionado({...pedidoSelecionado, status});
    }
  };

  const handleSalvarRastreio = async (id) => {
    const { error } = await supabase.from('pedidos').update({ codigo_rastreio: codigosRastreio[id] }).eq('id', id);
    if (!error) toast.success('Rastreio salvo!');
  };

  if (carregando) return <div className="text-center py-20 animate-pulse text-slate-500">Carregando painel...</div>;
  if (!user || perfil?.role !== 'admin') return <div className="text-center py-20"><ShieldAlert size={48} className="mx-auto text-red-500"/><h2>Acesso Negado</h2></div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12 relative">
      
      {/* CABEÇALHO */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
            <Printer className="text-blue-400" size={32} /> Central da Loja
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">Gerencie seus pedidos, produtos e acompanhe o crescimento.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2.5 px-5 rounded-xl backdrop-blur-sm transition-all cursor-pointer">
          <RefreshCw size={18} /> Atualizar Painel
        </button>
      </div>

      {/* INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-100/80 p-3 rounded-2xl text-green-600"><DollarSign size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faturamento (Mês)</p>
              <h3 className="text-2xl font-black text-slate-800">R$ {faturamentoMes.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100/80 p-3 rounded-2xl text-amber-600"><Clock size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fila de Produção</p>
              <h3 className="text-2xl font-black text-slate-800">{pedidosPendentes} <span className="text-base font-medium text-slate-500">pedidos</span></h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100/80 p-3 rounded-2xl text-blue-600"><Users size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Base</p>
              <h3 className="text-2xl font-black text-slate-800">{totalClientes}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-purple-500" /> Mais Vendidos
          </h4>
          <ul className="text-sm space-y-2">
            {maisVendidos.length > 0 ? (
              maisVendidos.map(([nome, quantidade], index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-slate-700 truncate pr-2 font-medium">{index + 1}. {nome}</span>
                  <span className="bg-slate-100 text-slate-600 text-xs py-1 px-2.5 rounded-lg font-bold">{quantidade}x</span>
                </li>
              ))
            ) : (<li className="text-slate-400 italic text-xs">Sem vendas ainda</li>)}
          </ul>
        </div>
      </div>

      {/* CONTROLE DE ABAS */}
      <div className="flex justify-center md:justify-start overflow-x-auto pb-2 custom-scrollbar">
        <div className="inline-flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 whitespace-nowrap">
          <button onClick={() => setAbaAtiva('pedidos')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${abaAtiva === 'pedidos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Truck size={18}/> Gestão Kanban
          </button>
          <button onClick={() => setAbaAtiva('estoque')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${abaAtiva === 'estoque' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Database size={18}/> Controle de Estoque
          </button>
          <button onClick={() => setAbaAtiva('produtos')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${abaAtiva === 'produtos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Box size={18}/> Catálogo de Produtos
          </button>
          <button onClick={() => setAbaAtiva('calculadora')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${abaAtiva === 'calculadora' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Calculator size={18}/> Calculadora de Custos
          </button>
        </div>
      </div>

      {/* =========================================
          ABA: PEDIDOS (KANBAN)
      ========================================= */}
      {abaAtiva === 'pedidos' && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative max-w-md">
            <input type="text" placeholder="Buscar pedido..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Search className="absolute left-4 top-3 text-slate-400" size={20}/>
          </div>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Carregando quadro...</div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
              {listaStatus.map(status => {
                const pedidosColuna = pedidos.filter(p => p.status === status && (p.id.includes(busca) || p.endereco_entrega.toLowerCase().includes(busca.toLowerCase())));
                return (
                  <div key={status} className="min-w-[320px] max-w-[320px] bg-slate-100/70 p-4 rounded-2xl border border-slate-200 shrink-0 snap-start flex flex-col max-h-[70vh]">
                    <div className="flex justify-between items-center mb-4 px-1">
                      <h4 className="font-bold text-slate-700 text-sm">{status}</h4>
                      <span className="bg-slate-200 text-slate-600 text-xs font-black px-2.5 py-1 rounded-full">{pedidosColuna.length}</span>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-grow">
                      {pedidosColuna.map(pedido => (
                        <div key={pedido.id} onClick={() => setPedidoSelecionado(pedido)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">#{pedido.id.slice(0,6)}</span>
                            <span className="text-xs text-slate-400 font-medium">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="text-sm text-slate-600 mb-3 truncate">{pedido.itens_pedido?.length} {pedido.itens_pedido?.length === 1 ? 'item' : 'itens'}</div>
                          <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                            <span className="text-xs font-bold text-slate-400">TOTAL</span>
                            <span className="font-black text-slate-800">R$ {Number(pedido.total).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================
          ABA: ESTOQUE (PRODUTOS PRONTOS E MATÉRIA PRIMA)
      ========================================= */}
      {abaAtiva === 'estoque' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* ESTOQUE DE MATÉRIA PRIMA */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Database className="text-blue-500"/> Matéria-Prima (Filamentos/Resinas)</h3>
                
                <form onSubmit={handleSalvarFilamento} className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nome (Ex: PLA Preto)</label>
                    <input type="text" value={formFilamento.nome} onChange={e => setFormFilamento({...formFilamento, nome: e.target.value})} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Cor</label>
                    <input type="color" value={formFilamento.cor} onChange={e => setFormFilamento({...formFilamento, cor: e.target.value})} className="w-full h-9 p-1 border rounded-lg cursor-pointer"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Peso Atual (g / ml)</label>
                    <input type="number" value={formFilamento.peso_atual} onChange={e => setFormFilamento({...formFilamento, peso_atual: e.target.value})} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Peso do Carretel (g / ml)</label>
                    <input type="number" value={formFilamento.peso_total} onChange={e => setFormFilamento({...formFilamento, peso_total: e.target.value})} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                  </div>
                  <div className="sm:col-span-2 flex gap-2 pt-2">
                    <button type="submit" disabled={salvandoId === 'filamento'} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all cursor-pointer">{editandoFilamento ? 'Salvar Edição' : 'Adicionar ao Estoque'}</button>
                    {editandoFilamento && <button type="button" onClick={() => {setEditandoFilamento(null); setFormFilamento({nome:'', cor:'#000000', peso_atual:1000, peso_total:1000})}} className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm cursor-pointer">Cancelar</button>}
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filamentos.map(fil => {
                    const porcentagem = Math.min(100, Math.max(0, (fil.peso_atual / fil.peso_total) * 100));
                    const isAcabando = porcentagem < 20;
                    return (
                      <div key={fil.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 relative">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: fil.cor }}></div>
                          <div className="flex-1 truncate">
                            <h4 className="font-bold text-slate-700 text-sm truncate">{fil.nome}</h4>
                            <p className="text-xs text-slate-500">{fil.peso_atual}g / {fil.peso_total}g</p>
                          </div>
                        </div>
                        
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-2.5 rounded-full ${isAcabando ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${porcentagem}%` }}></div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-1">
                          <button onClick={() => {setEditandoFilamento(fil); setFormFilamento(fil)}} className="text-blue-500 text-xs font-bold hover:underline cursor-pointer">Editar</button>
                          <span className="text-slate-300">|</span>
                          <button onClick={() => handleExcluirFilamento(fil.id)} className="text-red-500 text-xs font-bold hover:underline cursor-pointer">Excluir</button>
                        </div>
                      </div>
                    )
                  })}
                  {filamentos.length === 0 && <p className="text-sm text-slate-400 sm:col-span-2 text-center py-4">Nenhum material cadastrado.</p>}
                </div>
              </div>
            </div>

            {/* ESTOQUE DE PRODUTOS PRONTOS */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Box className="text-blue-500"/> Peças Prontas (Pronta Entrega)</h3>
                <p className="text-sm text-slate-500 mb-4">Controle quantas peças já impressas você tem guardadas na prateleira para envio imediato.</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden max-h-[650px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Produto</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase text-center w-32">Estoque</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {produtos.map(p => (
                        <tr key={p.id} className="hover:bg-white transition-colors">
                          <td className="p-3 text-sm font-semibold text-slate-700">{p.nome}</td>
                          <td className="p-3 flex items-center justify-center gap-3">
                            <button onClick={() => alterarEstoqueProduto(p, -1)} className="text-red-400 hover:text-red-600 cursor-pointer"><MinusCircle size={20}/></button>
                            <span className="font-black text-slate-800 w-6 text-center">{p.estoque || 0}</span>
                            <button onClick={() => alterarEstoqueProduto(p, 1)} className="text-green-500 hover:text-green-700 cursor-pointer"><PlusCircle size={20}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          ABA: PRODUTOS (CATÁLOGO)
      ========================================= */}
      {abaAtiva === 'produtos' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              {editandoProduto ? <><Pencil className="text-blue-500" size={24}/> Editar Produto</> : <><Plus className="text-blue-500" size={24}/> Cadastrar Novo Produto</>}
            </h3>
            <form onSubmit={handleSalvarProduto} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Produto</label>
                <input type="text" value={formProduto.nome} onChange={e => setFormProduto({...formProduto, nome: e.target.value})} required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preço (R$)</label>
                <input type="number" step="0.01" value={formProduto.preco} onChange={e => setFormProduto({...formProduto, preco: e.target.value})} required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Link da Imagem ou Arquivo 3D (.glb)</label>
                <input type="text" value={formProduto.imagem_url} onChange={e => setFormProduto({...formProduto, imagem_url: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estoque Inicial (Opcional)</label>
                <input type="number" value={formProduto.estoque} onChange={e => setFormProduto({...formProduto, estoque: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição</label>
                <textarea value={formProduto.descricao} onChange={e => setFormProduto({...formProduto, descricao: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" rows="3"></textarea>
              </div>
              <div className="md:col-span-3 flex gap-3 pt-2">
                <button type="submit" disabled={salvandoId === 'produto'} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer">
                  {editandoProduto ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
                {editandoProduto && (
                  <button type="button" onClick={() => {setEditandoProduto(null); setFormProduto({nome:'', preco:'', imagem_url:'', descricao:'', categoria:'Decoração', estoque: 0})}} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl cursor-pointer">Cancelar</button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Produto</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Estoque</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Preço</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {produtos.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-bold text-slate-700">{p.nome}</td>
                      <td className="p-5 text-slate-500 font-medium">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs">{p.estoque || 0} pç</span>
                      </td>
                      <td className="p-5 font-black text-blue-600">R$ {Number(p.preco).toFixed(2).replace('.', ',')}</td>
                      <td className="p-5 flex justify-center gap-2">
                        <button onClick={() => prepararEdicao(p)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"><Pencil size={18}/></button>
                        <button onClick={() => handleExcluirProduto(p.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          ABA: CALCULADORA DE CUSTOS (MANTIDA)
      ========================================= */}
      {abaAtiva === 'calculadora' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Calculator className="text-blue-500" size={24}/> Calculadora de Custos 3D
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3"><Box size={16}/> Material</h4>
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Peso da peça (gramas)</label><input type="number" value={calcPeso} onChange={e => setCalcPeso(Number(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Preço do Carretel (R$/kg)</label><input type="number" value={calcPrecoMaterial} onChange={e => setCalcPrecoMaterial(Number(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3"><Zap size={16}/> Energia & Tempo</h4>
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Tempo de Impressão (Horas)</label><input type="number" step="0.5" value={calcTempo} onChange={e => setCalcTempo(Number(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">R$ / kWh</label><input type="number" step="0.01" value={calcEnergia} onChange={e => setCalcEnergia(Number(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">Watts (Imp.)</label><input type="number" value={calcPotencia} onChange={e => setCalcPotencia(Number(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3"><Settings size={16}/> Máquina & Margem</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Taxa de Desgaste (R$ / Hora)</label><input type="number" step="0.1" value={calcDesgaste} onChange={e => setCalcDesgaste(Number(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Margem de Lucro Desejada (%)</label><input type="number" value={calcMargem} onChange={e => setCalcMargem(Number(e.target.value))} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl shadow-lg p-8 text-white h-fit sticky top-24">
            <h3 className="text-lg font-black flex items-center gap-2 mb-6"><Tag className="text-blue-400" size={20}/> Resumo de Custos</h3>
            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-white/10"><span className="text-slate-400">Material:</span><span className="font-bold">R$ {custoMaterial.toFixed(2)}</span></div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10"><span className="text-slate-400">Energia:</span><span className="font-bold">R$ {custoEnergia.toFixed(2)}</span></div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10"><span className="text-slate-400">Desgaste/Máquina:</span><span className="font-bold">R$ {custoMaquina.toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-2"><span className="text-slate-300 font-bold">CUSTO TOTAL:</span><span className="text-xl font-black text-amber-400">R$ {custoTotal.toFixed(2)}</span></div>
            </div>
            <div className="bg-white/10 p-5 rounded-xl border border-white/10 text-center">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Preço Sugerido</p>
              <h2 className="text-4xl font-black text-green-400 mb-2">R$ {precoSugerido.toFixed(2)}</h2>
              <p className="text-xs text-slate-400 font-medium">Lucro real: <span className="text-white font-bold">R$ {lucroReal.toFixed(2)}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL KANBAN (MANTIDO)
      ========================================= */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 relative">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">Pedido <span className="font-mono text-blue-600">#{pedidoSelecionado.id.slice(0,8)}</span></h3>
                <p className="text-sm text-slate-500 mt-1">Realizado em {new Date(pedidoSelecionado.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setPedidoSelecionado(null)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Fila de Impressão</h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <ul className="divide-y divide-slate-200 text-sm">
                    {pedidoSelecionado.itens_pedido?.map((item) => (
                      <li key={item.id} className="py-2 flex justify-between items-center"><span className="font-bold text-slate-700">{item.nome_produto}</span><span className="text-slate-500 font-medium">R$ {Number(item.preco_unitario).toFixed(2)}</span></li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center"><span className="font-bold text-slate-500">TOTAL PAGO</span><span className="text-xl font-black text-blue-600">R$ {Number(pedidoSelecionado.total).toFixed(2)}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Endereço de Entrega</h4>
                <p className="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{pedidoSelecionado.endereco_entrega}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status da Produção</label>
                  <select value={pedidoSelecionado.status} onChange={e => handleAlterarStatus(pedidoSelecionado.id, e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                    {listaStatus.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rastreio (Correios)</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Ex: AA1234567BR" value={codigosRastreio[pedidoSelecionado.id] || ''} onChange={e => setCodigosRastreio({...codigosRastreio, [pedidoSelecionado.id]: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 uppercase"/>
                    <button onClick={() => handleSalvarRastreio(pedidoSelecionado.id)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold p-3 rounded-xl cursor-pointer"><Send size={18}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}