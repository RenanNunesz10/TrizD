import { useEffect, useState } from 'react';
import { Package, Clock, RefreshCw, DollarSign, Users, TrendingUp, ShoppingBag, CreditCard, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [maisVendidos, setMaisVendidos] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);

  const fetchData = async () => {
    try {
      const { data: dPedidos } = await supabase.from('pedidos').select('*, itens_pedido(*)').order('created_at', { ascending: false });
      const { count } = await supabase.from('perfis').select('*', { count: 'exact', head: true }).eq('role', 'cliente');
      setTotalClientes(count || 0);

      const hoje = new Date();
      let faturamento = 0; let pendentes = 0; let qtdPedidosMes = 0; const contagemProd = {};

      const ultimos7Dias = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { nome: d.toLocaleDateString('pt-BR', { weekday: 'short' }), total: 0, dataReal: d.toISOString().split('T')[0] };
      });

      dPedidos?.forEach(p => {
        const dataPedido = new Date(p.created_at);
        const dataFormatada = p.created_at.split('T')[0];

        if (dataPedido.getMonth() === hoje.getMonth() && dataPedido.getFullYear() === hoje.getFullYear()) {
          faturamento += Number(p.total);
          qtdPedidosMes++;
        }

        if (['Aguardando Pagamento', 'Em Impressão 3D', 'Acabamento & Pintura'].includes(p.status)) pendentes++;
        p.itens_pedido?.forEach(i => contagemProd[i.nome_produto] = (contagemProd[i.nome_produto] || 0) + 1);

        const diaGrafico = ultimos7Dias.find(d => d.dataReal === dataFormatada);
        if (diaGrafico) diaGrafico.total += Number(p.total);
      });

      setFaturamentoMes(faturamento);
      setPedidosPendentes(pendentes);
      setTicketMedio(qtdPedidosMes > 0 ? (faturamento / qtdPedidosMes) : 0);
      setDadosGrafico(ultimos7Dias);
      setMaisVendidos(Object.entries(contagemProd).sort((a,b) => b[1]-a[1]).slice(0, 4));
    } catch (err) {
      toast.error('Erro ao carregar dados do Dashboard.');
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-gradient-to-r from-blue-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight">Visão Geral do Negócio</h2>
          <p className="text-blue-200 mt-1 font-medium">Acompanhe suas vendas e indicadores em tempo real.</p>
        </div>
        <button onClick={fetchData} className="relative z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-xl transition-all cursor-pointer font-semibold">
          <RefreshCw size={18} /> Sincronizar
        </button>
        <Activity size={200} className="absolute -right-10 -top-10 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4"><div className="bg-green-100 text-green-600 p-3 rounded-2xl"><DollarSign size={24} /></div></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faturamento (Mês)</p><h3 className="text-3xl font-black text-slate-800 mt-1">R$ {faturamentoMes.toFixed(2).replace('.', ',')}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4"><div className="bg-amber-100 text-amber-600 p-3 rounded-2xl"><Clock size={24} /></div></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fila de Produção</p><h3 className="text-3xl font-black text-slate-800 mt-1">{pedidosPendentes} <span className="text-lg text-slate-400 font-medium">pds</span></h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4"><div className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><CreditCard size={24} /></div></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Médio</p><h3 className="text-3xl font-black text-slate-800 mt-1">R$ {ticketMedio.toFixed(2).replace('.', ',')}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4"><div className="bg-purple-100 text-purple-600 p-3 rounded-2xl"><Users size={24} /></div></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Base</p><h3 className="text-3xl font-black text-slate-800 mt-1">{totalClientes}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><Activity className="text-blue-500"/> Faturamento (Últimos 7 dias)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Faturamento']} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><ShoppingBag className="text-purple-500"/> Produtos em Alta</h3>
          <div className="flex-1 flex flex-col justify-center">
            <ul className="space-y-4">
              {maisVendidos.length > 0 ? maisVendidos.map(([nome, qt], idx) => (
                <li key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-500'}`}>{idx + 1}</span>
                    <span className="text-slate-700 font-medium truncate group-hover:text-blue-600 transition-colors">{nome}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs py-1 px-3 rounded-lg font-black">{qt}x</span>
                </li>
              )) : (
                <div className="text-center py-8 text-slate-400">
                  <Package size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Nenhuma venda registrada</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}