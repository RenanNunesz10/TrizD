import { useEffect, useState } from 'react';
import { Database, PlusCircle, MinusCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [filamentos, setFilamentos] = useState([]);
  const [editandoFilamento, setEditandoFilamento] = useState(null);
  const [salvandoId, setSalvandoId] = useState(null);
  const [formFilamento, setFormFilamento] = useState({
    nome: '', cor: '#000000', peso_atual: 1000, peso_total: 1000
  });

  const fetchData = async () => {
    const { data: dProdutos } = await supabase.from('produtos').select('*').order('nome');
    setProdutos(dProdutos || []);

    const { data: dFilamentos } = await supabase.from('estoque_filamentos').select('*').order('created_at', { ascending: false });
    setFilamentos(dFilamentos || []);
  };

  useEffect(() => { fetchData(); }, []);

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
    } catch (err) { toast.error('Erro ao salvar material.'); } finally { setSalvandoId(null); }
  };

  const handleExcluirFilamento = async (id) => {
    if (!window.confirm('Excluir este material?')) return;
    try { await supabase.from('estoque_filamentos').delete().eq('id', id); toast.success('Removido!'); fetchData(); } catch (err) { toast.error('Erro.'); }
  };

  const alterarEstoqueProduto = async (produto, incremento) => {
    const novoEstoque = Math.max(0, (produto.estoque || 0) + incremento);
    try {
      await supabase.from('produtos').update({ estoque: novoEstoque }).eq('id', produto.id);
      setProdutos(produtos.map(p => p.id === produto.id ? { ...p, estoque: novoEstoque } : p));
    } catch (err) { toast.error('Erro ao atualizar estoque.'); }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-black tracking-tight">Gestão de Materiais e Pronta Entrega</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* MATÉRIA PRIMA */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Database className="text-blue-500"/> Filamentos & Resinas</h3>
          <form onSubmit={handleSalvarFilamento} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Nome (Ex: PLA Preto)</label><input type="text" value={formFilamento.nome} onChange={e => setFormFilamento({...formFilamento, nome: e.target.value})} required className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"/></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Cor</label><input type="color" value={formFilamento.cor} onChange={e => setFormFilamento({...formFilamento, cor: e.target.value})} className="w-full h-10 p-1 border rounded-xl cursor-pointer"/></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Peso Atual (g/ml)</label><input type="number" value={formFilamento.peso_atual} onChange={e => setFormFilamento({...formFilamento, peso_atual: e.target.value})} required className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"/></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Peso do Carretel</label><input type="number" value={formFilamento.peso_total} onChange={e => setFormFilamento({...formFilamento, peso_total: e.target.value})} required className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"/></div>
            <div className="sm:col-span-2 flex gap-2 pt-2">
              <button type="submit" disabled={salvandoId === 'filamento'} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all cursor-pointer">{editandoFilamento ? 'Salvar Edição' : 'Adicionar ao Estoque'}</button>
              {editandoFilamento && <button type="button" onClick={() => {setEditandoFilamento(null); setFormFilamento({nome:'', cor:'#000000', peso_atual:1000, peso_total:1000})}} className="bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm cursor-pointer">Cancelar</button>}
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filamentos.map(fil => {
              const porcentagem = Math.min(100, Math.max(0, (fil.peso_atual / fil.peso_total) * 100));
              return (
                <div key={fil.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: fil.cor }}></div>
                    <div className="flex-1 truncate"><h4 className="font-bold text-slate-700 text-sm truncate">{fil.nome}</h4><p className="text-xs text-slate-500">{fil.peso_atual}g / {fil.peso_total}g</p></div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full ${porcentagem < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${porcentagem}%` }}></div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-1">
                    <button onClick={() => {setEditandoFilamento(fil); setFormFilamento(fil)}} className="text-blue-500 text-xs font-bold hover:underline cursor-pointer">Editar</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={() => handleExcluirFilamento(fil.id)} className="text-red-500 text-xs font-bold hover:underline cursor-pointer">Excluir</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PRODUTOS PRONTOS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
          <h3 className="text-lg font-black text-slate-800 mb-4">Peças Prontas (Pronta Entrega)</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden max-h-[650px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Produto</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center w-32">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtos.map(p => (
                  <tr key={p.id} className="hover:bg-white transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{p.nome}</td>
                    <td className="p-4 flex items-center justify-center gap-3">
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
  );
}