import { useEffect, useState } from 'react';
import { Package, Truck, Printer, CheckCircle2, Clock, Search, Send, X, LayoutGrid, List } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [codigosRastreio, setCodigosRastreio] = useState({});
  
  // NOVO: Controle de visualização (kanban ou lista)
  const [modoVisao, setModoVisao] = useState('kanban');

  const listaStatus = ['Aguardando Pagamento', 'Em Impressão 3D', 'Acabamento & Pintura', 'Enviado', 'Entregue'];

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('pedidos').select('*, itens_pedido(*)').order('created_at', { ascending: false });
      setPedidos(data || []);

      const rastreios = {};
      data?.forEach(p => {
        rastreios[p.id] = p.codigo_rastreio || '';
      });
      setCodigosRastreio(rastreios);
    } catch (err) {
      toast.error('Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPedidos(); }, []);

  const handleAlterarStatus = async (id, status) => {
    const { error } = await supabase.from('pedidos').update({ status }).eq('id', id);
    if (!error) { 
      toast.success('Status atualizado!'); 
      fetchPedidos();
      if (pedidoSelecionado?.id === id) setPedidoSelecionado({...pedidoSelecionado, status});
    }
  };

  const handleSalvarRastreio = async (id) => {
    const { error } = await supabase.from('pedidos').update({ codigo_rastreio: codigosRastreio[id] }).eq('id', id);
    if (!error) toast.success('Rastreio salvo!');
  };

  // Filtra os pedidos com base na busca
  const pedidosFiltrados = pedidos.filter(p => 
    p.id.includes(busca) || p.endereco_entrega.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Esteira de Produção</h2>
          <p className="text-slate-400 mt-1 font-medium">Controle o status e os envios dos seus pedidos.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* BARRA DE BUSCA E CONTROLES DE VISUALIZAÇÃO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full max-w-md">
            <input type="text" placeholder="Buscar pedido por código ou endereço..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18}/>
          </div>

          <div className="flex bg-slate-200/60 p-1 rounded-xl w-full sm:w-auto">
            <button onClick={() => setModoVisao('kanban')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${modoVisao === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <LayoutGrid size={16}/> <span className="hidden sm:inline">Kanban</span>
            </button>
            <button onClick={() => setModoVisao('lista')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${modoVisao === 'lista' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <List size={16}/> <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 animate-pulse">Carregando pedidos...</div>
        ) : (
          <>
            {/* ================= VISUALIZAÇÃO EM KANBAN ================= */}
            {modoVisao === 'kanban' && (
              <div className="flex gap-6 overflow-x-auto pb-6 snap-x w-full custom-scrollbar">
                {listaStatus.map(status => {
                  const pedidosColuna = pedidosFiltrados.filter(p => p.status === status);
                  return (
                    <div key={status} className="min-w-[320px] max-w-[320px] bg-slate-100/50 p-4 rounded-3xl border border-slate-200 shrink-0 snap-start flex flex-col max-h-[70vh]">
                      <div className="flex justify-between items-center mb-4 px-2">
                        <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{status}</h4>
                        <span className="bg-white border border-slate-200 text-slate-600 text-xs font-black px-2.5 py-1 rounded-full shadow-sm">{pedidosColuna.length}</span>
                      </div>
                      <div className="space-y-3 overflow-y-auto pr-1 flex-grow custom-scrollbar">
                        {pedidosColuna.map(pedido => (
                          <div key={pedido.id} onClick={() => setPedidoSelecionado(pedido)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all group">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">#{pedido.id.slice(0,6)}</span>
                              <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Clock size={12}/> {new Date(pedido.created_at).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
                            </div>
                            <div className="text-sm text-slate-700 mb-4 font-medium flex items-center gap-2">
                              <Package size={14} className="text-slate-400" />
                              {pedido.itens_pedido?.length} {pedido.itens_pedido?.length === 1 ? 'item' : 'itens'}
                            </div>
                            <div className="flex justify-between pt-3 border-t border-slate-100 items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</span>
                              <span className="font-black text-slate-800">R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>
                        ))}
                        {pedidosColuna.length === 0 && (
                          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center opacity-50">
                            <CheckCircle2 size={24} className="text-slate-400 mb-2"/>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Limpo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= VISUALIZAÇÃO EM LISTA / TABELA ================= */}
            {modoVisao === 'lista' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Pedido / Data</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Itens</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Entrega</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pedidosFiltrados.map(pedido => (
                        <tr 
                          key={pedido.id} 
                          onClick={() => setPedidoSelecionado(pedido)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="p-5">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded w-fit">#{pedido.id.slice(0,8)}</span>
                              <span className="text-xs text-slate-500 font-medium">{new Date(pedido.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="text-sm font-bold text-slate-700">{pedido.itens_pedido?.length} pçs</span>
                          </td>
                          <td className="p-5">
                            <p className="text-sm text-slate-600 truncate max-w-[250px]" title={pedido.endereco_entrega}>{pedido.endereco_entrega}</p>
                          </td>
                          <td className="p-5">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap
                              ${pedido.status === 'Entregue' ? 'bg-green-100 text-green-700' : 
                                pedido.status === 'Enviado' ? 'bg-blue-100 text-blue-700' : 
                                pedido.status === 'Aguardando Pagamento' ? 'bg-amber-100 text-amber-700' : 
                                'bg-purple-100 text-purple-700'}`}
                            >
                              {pedido.status}
                            </span>
                          </td>
                          <td className="p-5 font-black text-slate-800 text-right">
                            R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      ))}
                      {pedidosFiltrados.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Nenhum pedido encontrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DETALHES DO PEDIDO (Mantido Intacto) */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Pedido <span className="text-blue-600 font-mono">#{pedidoSelecionado.id.slice(0,8)}</span></h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Realizado em {new Date(pedidoSelecionado.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setPedidoSelecionado(null)} className="p-2 bg-slate-200 hover:bg-slate-300 transition-colors rounded-full cursor-pointer text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2"><Printer size={16}/> O que imprimir</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <ul className="divide-y divide-slate-200 text-sm">
                    {pedidoSelecionado.itens_pedido?.map(item => (
                      <div key={item.id} className="flex justify-between py-2.5 first:pt-0 last:pb-0"><span className="font-bold text-slate-700">{item.nome_produto}</span><span className="font-medium text-slate-500">R$ {Number(item.preco_unitario).toFixed(2).replace('.',',')}</span></div>
                    ))}
                  </ul>
                  <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center"><span className="font-bold text-slate-400 text-xs tracking-wider">TOTAL PAGO</span><span className="text-xl font-black text-blue-600">R$ {Number(pedidoSelecionado.total).toFixed(2).replace('.',',')}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2"><Truck size={16}/> Endereço de Entrega</h4>
                <p className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 font-medium text-sm leading-relaxed">{pedidoSelecionado.endereco_entrega}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status da Produção</label>
                  <select value={pedidoSelecionado.status} onChange={e => handleAlterarStatus(pedidoSelecionado.id, e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                    {listaStatus.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rastreio (Correios)</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Ex: AA1234567BR" value={codigosRastreio[pedidoSelecionado.id] || ''} onChange={e => setCodigosRastreio({...codigosRastreio, [pedidoSelecionado.id]: e.target.value})} className="w-full p-3.5 border border-slate-200 rounded-xl bg-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"/>
                    <button onClick={() => handleSalvarRastreio(pedidoSelecionado.id)} className="bg-slate-800 hover:bg-slate-900 text-white p-3.5 rounded-xl cursor-pointer transition-colors shadow-sm"><Send size={18}/></button>
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