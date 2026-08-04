import { useEffect, useState } from 'react';
import { Tag, Percent, Plus, Trash2, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Promocoes() {
  const [cupons, setCupons] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form de Cupom
  const [formCupom, setFormCupom] = useState({ codigo: '', tipo: 'porcentagem', valor: '' });
  
  // Estado para edição rápida de oferta de produto
  const [ofertaEditando, setOfertaEditando] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: dCupons } = await supabase.from('cupons').select('*').order('created_at', { ascending: false });
      const { data: dProdutos } = await supabase.from('produtos').select('*').order('nome');
      
      setCupons(dCupons || []);
      setProdutos(dProdutos || []);

      const ofertasIniciais = {};
      dProdutos?.forEach(p => {
        ofertasIniciais[p.id] = p.preco_promocional || '';
      });
      setOfertaEditando(ofertasIniciais);
    } catch (err) {
      toast.error('Erro ao carregar dados de promoções.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- GESTÃO DE CUPONS ---
  const handleCriarCupom = async (e) => {
    e.preventDefault();
    if (!formCupom.codigo || !formCupom.valor) return toast.error('Preencha os campos obrigatórios.');

    try {
      const { error } = await supabase.from('cupons').insert([{
        codigo: formCupom.codigo.toUpperCase().trim(),
        tipo: formCupom.tipo,
        valor: Number(formCupom.valor),
        ativo: true
      }]);

      if (error) throw error;
      toast.success('Cupom criado com sucesso!');
      setFormCupom({ codigo: '', tipo: 'porcentagem', valor: '' });
      fetchData();
    } catch (err) {
      toast.error('Erro ao criar cupom. Verifique se o código já existe.');
    }
  };

  const handleToggleCupom = async (cupom) => {
    try {
      await supabase.from('cupons').update({ ativo: !cupom.ativo }).eq('id', cupom.id);
      toast.success(`Cupom ${!cupom.ativo ? 'ativado' : 'desativado'}!`);
      fetchData();
    } catch (err) {
      toast.error('Erro ao atualizar cupom.');
    }
  };

  const handleExcluirCupom = async (id) => {
    if (!window.confirm('Excluir este cupom?')) return;
    try {
      await supabase.from('cupons').delete().eq('id', id);
      toast.success('Cupom removido!');
      fetchData();
    } catch (err) {
      toast.error('Erro ao excluir.');
    }
  };

  // --- GESTÃO DE OFERTAS EM PRODUTOS ---
  const handleSalvarOferta = async (produtoId) => {
    const valorPromocional = ofertaEditando[produtoId];
    const precoPromo = valorPromocional !== '' ? Number(valorPromocional) : null;

    try {
      await supabase.from('produtos').update({ preco_promocional: precoPromo }).eq('id', produtoId);
      toast.success('Oferta atualizada!');
      fetchData();
    } catch (err) {
      toast.error('Erro ao salvar oferta.');
    }
  };

  const handleRemoverOferta = async (produtoId) => {
    try {
      await supabase.from('produtos').update({ preco_promocional: null }).eq('id', produtoId);
      toast.success('Oferta removida!');
      setOfertaEditando({ ...ofertaEditando, [produtoId]: '' });
      fetchData();
    } catch (err) {
      toast.error('Erro ao remover oferta.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-3xl font-black tracking-tight">Ofertas & Cupons de Desconto</h2>
        <p className="text-slate-400 mt-1 font-medium">Crie campanhas, gerencie cupons e aplique preços promocionais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SEÇÃO 1: CRIAR E LISTAR CUPONS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Tag className="text-blue-600" size={20}/> Novo Cupom
            </h3>
            <form onSubmit={handleCriarCupom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Código (Ex: PRIMEIRA10)</label>
                <input type="text" value={formCupom.codigo} onChange={e => setFormCupom({...formCupom, codigo: e.target.value})} placeholder="PRIMEIRA10" required className="w-full p-3 border rounded-xl bg-slate-50 outline-none uppercase font-mono font-bold text-slate-800"/>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo</label>
                  <select value={formCupom.tipo} onChange={e => setFormCupom({...formCupom, tipo: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 outline-none text-sm font-medium">
                    <option value="porcentagem">Porcentagem (%)</option>
                    <option value="fixo">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Desconto</label>
                  <input type="number" step="0.01" value={formCupom.valor} onChange={e => setFormCupom({...formCupom, valor: e.target.value})} placeholder={formCupom.tipo === 'porcentagem' ? '10' : '15.00'} required className="w-full p-3 border rounded-xl bg-slate-50 outline-none text-sm font-bold"/>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                <Plus size={18}/> Criar Cupom
              </button>
            </form>
          </div>

          {/* LISTA DE CUPONS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-800">Cupons Ativos</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {cupons.map(c => (
                <div key={c.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between bg-slate-50">
                  <div>
                    <span className="font-mono font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-sm">{c.codigo}</span>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      {c.tipo === 'porcentagem' ? `${c.valor}% OFF` : `R$ ${Number(c.valor).toFixed(2)} OFF`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleCupom(c)} className={`p-1.5 rounded-lg cursor-pointer ${c.ativo ? 'text-green-600 hover:bg-green-100' : 'text-slate-400 hover:bg-slate-200'}`} title={c.ativo ? 'Desativar' : 'Ativar'}>
                      {c.ativo ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                    </button>
                    <button onClick={() => handleExcluirCupom(c.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
              {cupons.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Nenhum cupom cadastrado.</p>}
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: OFERTAS EM PRODUTOS (PREÇO PROMOCIONAL) */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-blue-600" size={22}/> Preços Promocionais por Produto
          </h3>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Produto</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Preço Normal</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Preço Promocional (R$)</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {produtos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-700 text-sm">{p.nome}</td>
                    <td className="p-4 font-semibold text-slate-500 text-sm">R$ {Number(p.preco).toFixed(2)}</td>
                    <td className="p-4">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 89.90"
                        value={ofertaEditando[p.id] || ''}
                        onChange={e => setOfertaEditando({ ...ofertaEditando, [p.id]: e.target.value })}
                        className="w-32 p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-blue-600 text-sm outline-none focus:bg-white focus:border-blue-500"
                      />
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => handleSalvarOferta(p.id)} className="bg-slate-800 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition">
                        Salvar
                      </button>
                      {p.preco_promocional && (
                        <button onClick={() => handleRemoverOferta(p.id)} className="text-red-500 hover:underline text-xs font-bold cursor-pointer">
                          Remover
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}