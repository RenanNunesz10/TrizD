import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Printer, CheckCircle2, Clock, Search, Send, RefreshCw, ShieldAlert, DollarSign, Users, TrendingUp, Plus, Pencil, Trash2, Box } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, perfil, carregando } = useAuthStore();
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const [produtos, setProdutos] = useState([]);
  const [editandoProduto, setEditandoProduto] = useState(null);
  const [formProduto, setFormProduto] = useState({
    nome: '', preco: '', imagem_url: '', descricao: '', categoria: 'Decoração'
  });

  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [maisVendidos, setMaisVendidos] = useState([]);

  const [codigosRastreio, setCodigosRastreio] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);

  const listaStatus = ['Aguardando Pagamento', 'Em Impressão 3D', 'Acabamento & Pintura', 'Enviado', 'Entregue'];
  const categorias = ['Decoração', 'Geek', 'Utilidades'];

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: dPedidos } = await supabase.from('pedidos').select('*, itens_pedido(*)').order('created_at', { ascending: false });
      setPedidos(dPedidos || []);

      const { data: dProdutos } = await supabase.from('produtos').select('*').order('nome');
      setProdutos(dProdutos || []);

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
    if (!carregando) {
      if (!user || perfil?.role !== 'admin') return;
      fetchData();
    }
  }, [user, perfil, carregando]);

  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setSalvandoId('produto');
    const dadosParaSalvar = { ...formProduto, preco: Number(formProduto.preco) };

    try {
      if (editandoProduto) {
        await supabase.from('produtos').update(dadosParaSalvar).eq('id', editandoProduto.id);
        toast.success('Produto atualizado!');
      } else {
        await supabase.from('produtos').insert([dadosParaSalvar]);
        toast.success('Produto cadastrado!');
      }
      setFormProduto({ nome: '', preco: '', imagem_url: '', descricao: '', categoria: 'Decoração' });
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
    setFormProduto({ nome: p.nome, preco: p.preco, imagem_url: p.imagem_url || '', descricao: p.descricao || '', categoria: p.categoria || 'Decoração' });
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleAlterarStatus = async (id, status) => {
    const { error } = await supabase.from('pedidos').update({ status }).eq('id', id);
    if (!error) { toast.success('Status atualizado!'); fetchData(); }
  };

  const handleSalvarRastreio = async (id) => {
    const { error } = await supabase.from('pedidos').update({ codigo_rastreio: codigosRastreio[id] }).eq('id', id);
    if (!error) toast.success('Rastreio salvo!');
  };

  if (carregando) return <div className="text-center py-20 animate-pulse text-gray-500">Carregando painel...</div>;
  if (!user || perfil?.role !== 'admin') return <div className="text-center py-20"><ShieldAlert size={48} className="mx-auto text-red-500"/><h2>Acesso Negado</h2></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* CABEÇALHO COM GRADIENTE */}
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

      {/* INDICADORES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-100/80 p-3 rounded-2xl text-green-600"><DollarSign size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faturamento (Mês)</p>
              <h3 className="text-2xl font-black text-slate-800">R$ {faturamentoMes.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100/80 p-3 rounded-2xl text-amber-600"><Clock size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fila de Produção</p>
              <h3 className="text-2xl font-black text-slate-800">{pedidosPendentes} <span className="text-base font-medium text-slate-500">pedidos</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100/80 p-3 rounded-2xl text-blue-600"><Users size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Base</p>
              <h3 className="text-2xl font-black text-slate-800">{totalClientes}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-center">
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
            ) : (
              <li className="text-slate-400 italic text-xs">Sem vendas ainda</li>
            )}
          </ul>
        </div>
      </div>

      {/* CONTROLE DE ABAS ESTILO PÍLULA */}
      <div className="flex justify-center md:justify-start">
        <div className="inline-flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setAbaAtiva('pedidos')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${abaAtiva === 'pedidos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Truck size={18}/> Gestão de Pedidos
          </button>
          <button 
            onClick={() => setAbaAtiva('produtos')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${abaAtiva === 'produtos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Box size={18}/> Catálogo de Produtos
          </button>
        </div>
      </div>

      {/* =========================================
          ABA: PEDIDOS
      ========================================= */}
      {abaAtiva === 'pedidos' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Busca Isolada */}
          <div className="relative max-w-md">
            <input 
              type="text" 
              placeholder="Buscar pedido por código ou endereço..." 
              value={busca} 
              onChange={e => setBusca(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-4 top-3 text-slate-400" size={20}/>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Carregando pedidos...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pedidos.filter(p => p.id.includes(busca) || p.endereco_entrega.toLowerCase().includes(busca.toLowerCase())).map(pedido => (
                <div key={pedido.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  
                  {/* Cabeçalho do Pedido */}
                  <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">#{pedido.id.slice(0,8)}</span>
                        <span className="text-sm font-medium text-slate-500">{new Date(pedido.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-sm text-slate-600 flex items-start gap-2 mt-2">
                        <span className="font-bold text-slate-800">Entrega:</span> {pedido.endereco_entrega}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Total do Pedido</span>
                      <span className="text-2xl font-black text-blue-600">R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  {/* Corpo do Pedido */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Lista de Peças */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Printer size={16} /> Fila de Impressão
                      </h4>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <ul className="divide-y divide-slate-200 text-sm">
                          {pedido.itens_pedido?.map((item) => (
                            <li key={item.id} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                              <span className="font-bold text-slate-700">{item.nome_produto}</span>
                              <span className="text-slate-500 font-medium">R$ {Number(item.preco_unitario).toFixed(2).replace('.', ',')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Controles de Status e Rastreio */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status da Produção</label>
                        <select 
                          value={pedido.status} 
                          onChange={e => handleAlterarStatus(pedido.id, e.target.value)} 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          {listaStatus.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Código de Rastreio (Correios)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Ex: AA123456789BR" 
                            value={codigosRastreio[pedido.id] || ''} 
                            onChange={e => setCodigosRastreio({...codigosRastreio, [pedido.id]: e.target.value})} 
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                          />
                          <button 
                            onClick={() => handleSalvarRastreio(pedido.id)} 
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold p-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                          >
                            <Send size={18}/> <span className="hidden sm:inline">Salvar</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
              
              {pedidos.length === 0 && !loading && (
                 <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-500 font-medium">Nenhum pedido encontrado.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================
          ABA: PRODUTOS
      ========================================= */}
      {abaAtiva === 'produtos' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Formulário de Produto */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              {editandoProduto ? <><Pencil className="text-blue-500" size={24}/> Editar Produto</> : <><Plus className="text-blue-500" size={24}/> Cadastrar Novo Produto</>}
            </h3>
            
            <form onSubmit={handleSalvarProduto} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Produto</label>
                <input type="text" placeholder="Ex: Vaso Groot" value={formProduto.nome} onChange={e => setFormProduto({...formProduto, nome: e.target.value})} required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preço (R$)</label>
                <input type="number" step="0.01" placeholder="Ex: 50.00" value={formProduto.preco} onChange={e => setFormProduto({...formProduto, preco: e.target.value})} required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Link da Imagem ou Arquivo 3D (.glb)</label>
                <input type="text" placeholder="https://... ou /modelo.glb" value={formProduto.imagem_url} onChange={e => setFormProduto({...formProduto, imagem_url: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoria</label>
                <select value={formProduto.categoria} onChange={e => setFormProduto({...formProduto, categoria: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700">
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição</label>
                <textarea placeholder="Detalhes sobre o material, tamanho, acabamento..." value={formProduto.descricao} onChange={e => setFormProduto({...formProduto, descricao: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" rows="3"></textarea>
              </div>
              
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={salvandoId === 'produto'} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                  {editandoProduto ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
                {editandoProduto && (
                  <button type="button" onClick={() => {setEditandoProduto(null); setFormProduto({nome:'', preco:'', imagem_url:'', descricao:'', categoria:'Decoração'})}} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all cursor-pointer">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Produto</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Preço</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {produtos.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 font-bold text-slate-700">{p.nome}</td>
                      <td className="p-5 text-slate-500 font-medium">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs">{p.categoria}</span>
                      </td>
                      <td className="p-5 font-black text-blue-600">R$ {Number(p.preco).toFixed(2).replace('.', ',')}</td>
                      <td className="p-5 flex justify-center gap-2">
                        <button onClick={() => prepararEdicao(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="Editar">
                          <Pencil size={18}/>
                        </button>
                        <button onClick={() => handleExcluirProduto(p.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Excluir">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {produtos.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">Nenhum produto cadastrado no catálogo.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}