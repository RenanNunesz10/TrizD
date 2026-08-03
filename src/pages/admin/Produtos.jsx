import { useEffect, useState } from 'react';
import { Box, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [editandoProduto, setEditandoProduto] = useState(null);
  const [salvandoId, setSalvandoId] = useState(null);
  const [formProduto, setFormProduto] = useState({
    nome: '', preco: '', imagem_url: '', descricao: '', categoria: 'Decoração', estoque: 0
  });

  const categorias = ['Decoração', 'Geek', 'Utilidades'];

  const fetchData = async () => {
    const { data } = await supabase.from('produtos').select('*').order('nome');
    setProdutos(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setSalvandoId('produto');
    const dados = { ...formProduto, preco: Number(formProduto.preco), estoque: Number(formProduto.estoque) };
    try {
      if (editandoProduto) {
        await supabase.from('produtos').update(dados).eq('id', editandoProduto.id);
        toast.success('Produto atualizado!');
      } else {
        await supabase.from('produtos').insert([dados]);
        toast.success('Produto cadastrado!');
      }
      setFormProduto({ nome: '', preco: '', imagem_url: '', descricao: '', categoria: 'Decoração', estoque: 0 });
      setEditandoProduto(null);
      fetchData();
    } catch (err) { toast.error('Erro ao salvar.'); } finally { setSalvandoId(null); }
  };

  const handleExcluirProduto = async (id) => {
    if (!window.confirm('Excluir este produto?')) return;
    try { await supabase.from('produtos').delete().eq('id', id); toast.success('Removido!'); fetchData(); } catch (err) { toast.error('Erro ao excluir.'); }
  };

  const prepararEdicao = (p) => {
    setEditandoProduto(p);
    setFormProduto({ nome: p.nome, preco: p.preco, imagem_url: p.imagem_url || '', descricao: p.descricao || '', categoria: p.categoria || 'Decoração', estoque: p.estoque || 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-black tracking-tight">Catálogo e Precificação</h2>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          {editandoProduto ? <><Pencil className="text-blue-500" size={24}/> Editar Produto</> : <><Plus className="text-blue-500" size={24}/> Cadastrar Novo Produto</>}
        </h3>
        <form onSubmit={handleSalvarProduto} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-400 mb-1">Nome do Produto</label><input type="text" value={formProduto.nome} onChange={e => setFormProduto({...formProduto, nome: e.target.value})} required className="w-full p-3 border rounded-xl bg-slate-50 outline-none"/></div>
          <div><label className="block text-xs font-bold text-slate-400 mb-1">Preço (R$)</label><input type="number" step="0.01" value={formProduto.preco} onChange={e => setFormProduto({...formProduto, preco: e.target.value})} required className="w-full p-3 border rounded-xl bg-slate-50 outline-none"/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-400 mb-1">Link Imagem/3D (.glb)</label><input type="text" value={formProduto.imagem_url} onChange={e => setFormProduto({...formProduto, imagem_url: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 outline-none"/></div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Categoria</label>
            <select value={formProduto.categoria} onChange={e => setFormProduto({...formProduto, categoria: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 outline-none">{categorias.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div className="md:col-span-3"><label className="block text-xs font-bold text-slate-400 mb-1">Descrição</label><textarea value={formProduto.descricao} onChange={e => setFormProduto({...formProduto, descricao: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 outline-none" rows="3"></textarea></div>
          <div className="md:col-span-3 flex gap-3 pt-2">
            <button type="submit" disabled={salvandoId === 'produto'} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer">{editandoProduto ? 'Salvar Alterações' : 'Cadastrar Produto'}</button>
            {editandoProduto && <button type="button" onClick={() => {setEditandoProduto(null); setFormProduto({nome:'', preco:'', imagem_url:'', descricao:'', categoria:'Decoração', estoque: 0})}} className="bg-slate-100 font-bold py-3 px-8 rounded-xl cursor-pointer">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Produto</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Estoque</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Preço</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {produtos.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="p-5 font-bold text-slate-700">{p.nome}</td>
                <td className="p-5 text-slate-500 font-medium"><span className="bg-slate-100 px-3 py-1 rounded-lg text-xs">{p.estoque || 0} pç</span></td>
                <td className="p-5 font-black text-blue-600">R$ {Number(p.preco).toFixed(2).replace('.', ',')}</td>
                <td className="p-5 flex justify-center gap-2">
                  <button onClick={() => prepararEdicao(p)} className="p-2 text-slate-400 hover:text-blue-600 rounded-xl cursor-pointer"><Pencil size={18}/></button>
                  <button onClick={() => handleExcluirProduto(p.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-xl cursor-pointer"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}