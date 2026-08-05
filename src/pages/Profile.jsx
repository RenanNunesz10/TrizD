import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, Printer, User, MapPin, Key, Plus, Trash2, Edit3, Heart, Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

export default function Profile() {
  const { user, perfil, checkUser } = useAuthStore();
  
  // Controle de Abas: 'pedidos' | 'dados' | 'enderecos' | 'favoritos'
  const [abaAtiva, setAbaAtiva] = useState('pedidos');

  // Estados de Dados Pessoais
  const [nome, setNome] = useState(perfil?.nome || '');
  const [telefone, setTelefone] = useState(perfil?.telefone || '');
  const [salvandoDados, setSalvandoDados] = useState(false);

  // Estados de Troca de Senha
  const [novaSenha, setNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Estados de Pedidos e Avaliações
  const [pedidos, setPedidos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  // Formulário de Avaliação Aberto
  const [itemEmAvaliacao, setItemEmAvaliacao] = useState(null); // { pedidoId, nomeProduto }
  const [notaEstrelas, setNotaEstrelas] = useState(5);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  // Estados de Endereços
  const [enderecos, setEnderecos] = useState([]);
  const [loadingEnderecos, setLoadingEnderecos] = useState(true);
  const [novoEndereco, setNovoEndereco] = useState({
    titulo: 'Casa', rua: '', numero: '', complemento: '', bairro: '', cidade: '', cep: ''
  });
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);

  // Estados de Favoritos
  const [produtosFavoritos, setProdutosFavoritos] = useState([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(true);

  const etapasStatus = [
    { label: 'Aguardando Pagamento', icon: Clock },
    { label: 'Em Impressão 3D', icon: Printer },
    { label: 'Acabamento & Pintura', icon: Package },
    { label: 'Enviado', icon: Truck },
    { label: 'Entregue', icon: CheckCircle2 },
  ];

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome || '');
      setTelefone(perfil.telefone || '');
    }
  }, [perfil]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      // Pedidos
      setLoadingPedidos(true);
      const { data: dataPedidos } = await supabase
        .from('pedidos')
        .select('*, itens_pedido(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setPedidos(dataPedidos || []);

      // Avaliações
      const { data: dataAvaliacoes } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('user_id', user.id);
      setAvaliacoes(dataAvaliacoes || []);

      setLoadingPedidos(false);

      // Endereços
      setLoadingEnderecos(true);
      const { data: dataEnderecos } = await supabase
        .from('enderecos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setEnderecos(dataEnderecos || []);
      setLoadingEnderecos(false);

      // Favoritos
      setLoadingFavoritos(true);
      const { data: dataFavoritos } = await supabase
        .from('favoritos')
        .select('*, produtos(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (dataFavoritos) {
        setProdutosFavoritos(dataFavoritos.map(fav => fav.produtos).filter(Boolean));
      }
      setLoadingFavoritos(false);
    }

    fetchData();
  }, [user]);

  // Enviar Avaliação
  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    if (!itemEmAvaliacao) return;

    setEnviandoAvaliacao(true);
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .insert([{
          user_id: user.id,
          pedido_id: itemEmAvaliacao.pedidoId,
          nome_produto: itemEmAvaliacao.nomeProduto,
          nota: notaEstrelas,
          comentario: comentarioTexto
        }])
        .select();

      if (error) throw error;

      toast.success('Avaliação enviada com sucesso! Obrigado pelo feedback. ⭐');
      setAvaliacoes([...avaliacoes, data[0]]);
      setItemEmAvaliacao(null);
      setComentarioTexto('');
      setNotaEstrelas(5);
    } catch (err) {
      toast.error('Erro ao enviar avaliação.');
      console.error(err);
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  const buscarCEPPerfil = async (cepBuscado) => {
    const cepLimpo = cepBuscado.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado.');
        return;
      }

      setNovoEndereco((prev) => ({
        ...prev,
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: `${data.localidade} / ${data.uf}`,
        cep: data.cep
      }));
      toast.success('Endereço encontrado!', { icon: '📍' });
    } catch (error) {
      toast.error('Erro ao buscar o CEP.');
    }
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setSalvandoDados(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ nome, telefone })
        .eq('id', user.id);

      if (error) throw error;

      await checkUser();
      toast.success('Dados atualizados com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar dados.');
      console.error(err);
    } finally {
      setSalvandoDados(false);
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSalvandoSenha(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      setNovaSenha('');
    } catch (err) {
      toast.error('Erro ao alterar senha.');
      console.error(err);
    } finally {
      setSalvandoSenha(false);
    }
  };

  const handleAdicionarEndereco = async (e) => {
    e.preventDefault();
    setSalvandoEndereco(true);
    try {
      const { data, error } = await supabase
        .from('enderecos')
        .insert([{ ...novoEndereco, user_id: user.id }])
        .select();

      if (error) throw error;

      setEnderecos([data[0], ...enderecos]);
      setNovoEndereco({ titulo: 'Casa', rua: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '' });
      toast.success('Endereço cadastrado!');
    } catch (err) {
      toast.error('Erro ao salvar endereço.');
      console.error(err);
    } finally {
      setSalvandoEndereco(false);
    }
  };

  const handleRemoverEndereco = async (id) => {
    try {
      const { error } = await supabase.from('enderecos').delete().eq('id', id);
      if (error) throw error;

      setEnderecos(enderecos.filter((e) => e.id !== id));
      toast.success('Endereço removido!');
    } catch (err) {
      toast.error('Erro ao remover endereço.');
    }
  };

  const getEtapaIndex = (status) => etapasStatus.findIndex((e) => e.label === status);

  return (
    // CORREÇÃO: Adicionamos w-full p-4 md:p-8 e pb-24 (para o mobile)
    <div className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 p-4 md:p-8 pb-28 md:pb-8 animate-fade-in">
      
      {/* Cabeçalho do Perfil */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 md:p-4 rounded-full shrink-0">
          <User size={28} className="md:w-8 md:h-8" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate">{perfil?.nome || 'Cliente'}</h2>
          <p className="text-gray-500 text-xs md:text-sm truncate">{user?.email}</p>
        </div>
      </div>

      {/* Navegação por Abas - Agora com custom-scrollbar e sem-wrap */}
      <div className="flex border-b border-gray-200 gap-2 md:gap-4 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setAbaAtiva('pedidos')}
          className={`pb-3 px-2 md:px-4 text-sm md:text-base font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            abaAtiva === 'pedidos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package size={18} className="md:w-5 md:h-5" /> Pedidos
        </button>

        <button
          onClick={() => setAbaAtiva('dados')}
          className={`pb-3 px-2 md:px-4 text-sm md:text-base font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            abaAtiva === 'dados' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Edit3 size={18} className="md:w-5 md:h-5" /> Dados
        </button>

        <button
          onClick={() => setAbaAtiva('enderecos')}
          className={`pb-3 px-2 md:px-4 text-sm md:text-base font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            abaAtiva === 'enderecos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin size={18} className="md:w-5 md:h-5" /> Endereços
        </button>

        <button
          onClick={() => setAbaAtiva('favoritos')}
          className={`pb-3 px-2 md:px-4 text-sm md:text-base font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            abaAtiva === 'favoritos' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Heart size={18} className="md:w-5 md:h-5" /> Favoritos
        </button>
      </div>

      {/* ABA 1: MEUS PEDIDOS */}
      {abaAtiva === 'pedidos' && (
        <div className="space-y-6">
          {loadingPedidos ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : pedidos.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-gray-200 text-gray-500 shadow-sm">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-bold text-gray-700">Você ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            pedidos.map((pedido) => {
              const etapaAtual = getEtapaIndex(pedido.status);
              const isEntregue = pedido.status === 'Entregue';

              return (
                <div key={pedido.id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 pb-4 gap-2">
                    <div>
                      <span className="text-xs text-gray-400 font-mono font-bold bg-gray-50 px-2 py-1 rounded">PEDIDO #{pedido.id.slice(0, 8).toUpperCase()}</span>
                      <p className="text-sm text-gray-500 mt-2 font-medium">
                        Data: {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <span className="font-black text-xl text-blue-600">
                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Progresso do Pedido - Flex Wrap no Celular */}
                  <div className="py-2">
                    <p className="text-xs md:text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Status da Produção:</p>
                    <div className="flex flex-wrap md:grid md:grid-cols-5 gap-3 md:gap-4">
                      {etapasStatus.map((etapa, idx) => {
                        const Icon = etapa.icon;
                        const concluida = idx <= etapaAtual;
                        return (
                          <div key={etapa.label} className={`flex-1 min-w-[120px] p-3 rounded-xl border flex flex-col items-center text-center transition-colors ${
                            concluida ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-400'
                          }`}>
                            <Icon size={20} className="mb-2" />
                            <span className="text-[10px] md:text-xs font-bold leading-tight">{etapa.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lista de Itens */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4">Itens Comprados</h4>
                    <div className="divide-y divide-gray-200 space-y-4">
                      {pedido.itens_pedido?.map((item) => {
                        const avaliacaoExistente = avaliacoes.find(
                          (a) => a.pedido_id === pedido.id && a.nome_produto === item.nome_produto
                        );
                        const emEdicao = itemEmAvaliacao?.pedidoId === pedido.id && itemEmAvaliacao?.nomeProduto === item.nome_produto;

                        return (
                          <div key={item.id} className="pt-4 first:pt-0">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div>
                                <p className="font-bold text-gray-800 text-sm md:text-base">{item.nome_produto}</p>
                                <p className="text-xs md:text-sm text-gray-500 font-medium">R$ {Number(item.preco_unitario).toFixed(2).replace('.', ',')} <span className="text-gray-400 mx-1">•</span> Qtd: {item.quantidade}</p>
                              </div>

                              {isEntregue && !avaliacaoExistente && !emEdicao && (
                                <button
                                  onClick={() => setItemEmAvaliacao({ pedidoId: pedido.id, nomeProduto: item.nome_produto })}
                                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
                                >
                                  <Star size={14} className="fill-white" /> Avaliar Produto
                                </button>
                              )}
                            </div>

                            {/* Exibe a Avaliação */}
                            {avaliacaoExistente && (
                              <div className="mt-3 p-3 bg-amber-50/80 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-1 text-amber-500 mb-1.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < avaliacaoExistente.nota ? 'fill-amber-400' : 'text-gray-300'} />
                                  ))}
                                  <span className="ml-2 text-[10px] font-bold text-amber-700 uppercase tracking-wide">Sua Avaliação</span>
                                </div>
                                {avaliacaoExistente.comentario && (
                                  <p className="text-gray-600 text-xs italic font-medium">"{avaliacaoExistente.comentario}"</p>
                                )}
                              </div>
                            )}

                            {/* Form de Avaliação Aberto */}
                            {emEdicao && (
                              <form onSubmit={handleEnviarAvaliacao} className="mt-4 p-4 md:p-5 bg-white rounded-xl border border-amber-200 shadow-md space-y-4 animate-fade-in">
                                <h5 className="text-sm font-black text-gray-800">Sua nota para "{item.nome_produto}"</h5>
                                
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((estrela) => (
                                    <button
                                      type="button"
                                      key={estrela}
                                      onClick={() => setNotaEstrelas(estrela)}
                                      className="p-1.5 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                                    >
                                      <Star size={28} className={estrela <= notaEstrelas ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-gray-200'} />
                                    </button>
                                  ))}
                                </div>

                                <textarea
                                  placeholder="Conte o que achou da qualidade do acabamento..."
                                  value={comentarioTexto}
                                  onChange={(e) => setComentarioTexto(e.target.value)}
                                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-gray-50 focus:bg-white transition-colors"
                                  rows="2"
                                />

                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                  <button
                                    type="submit"
                                    disabled={enviandoAvaliacao}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:bg-gray-300"
                                  >
                                    {enviandoAvaliacao ? 'Enviando...' : 'Publicar Avaliação'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setItemEmAvaliacao(null)}
                                    className="sm:w-32 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </form>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* ABA 2: MEUS DADOS */}
      {abaAtiva === 'dados' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base md:text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Informações Pessoais
            </h3>
            <form onSubmit={handleSalvarPerfil} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={salvandoDados}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3 px-8 rounded-xl transition-colors cursor-pointer disabled:bg-blue-300 mt-2"
              >
                {salvandoDados ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base md:text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <Key size={20} className="text-blue-600" /> Alterar Senha
            </h3>
            <form onSubmit={handleAlterarSenha} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={salvandoSenha}
                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white font-black text-sm py-3 px-8 rounded-xl transition-colors cursor-pointer disabled:bg-gray-300 mt-2"
              >
                {salvandoSenha ? 'Alterando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ABA 3: ENDEREÇOS SALVOS */}
      {abaAtiva === 'enderecos' && (
        <div className="space-y-8">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base md:text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" /> Novo Endereço
            </h3>
            <form onSubmit={handleAdicionarEndereco} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Título (Ex: Casa)</label>
                  <input
                    type="text"
                    value={novoEndereco.titulo}
                    onChange={(e) => setNovoEndereco({ ...novoEndereco, titulo: e.target.value })}
                    required
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CEP</label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={novoEndereco.cep}
                    onChange={(e) => setNovoEndereco({ ...novoEndereco, cep: e.target.value })}
                    onBlur={(e) => buscarCEPPerfil(e.target.value)}
                    required
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Cidade / Estado</label>
                  <input
                    type="text"
                    value={novoEndereco.cidade}
                    onChange={(e) => setNovoEndereco({ ...novoEndereco, cidade: e.target.value })}
                    required
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rua / Avenida</label>
                  <input
                    type="text"
                    value={novoEndereco.rua}
                    onChange={(e) => setNovoEndereco({ ...novoEndereco, rua: e.target.value })}
                    required
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Número</label>
                  <input
                    type="text"
                    value={novoEndereco.numero}
                    onChange={(e) => setNovoEndereco({ ...novoEndereco, numero: e.target.value })}
                    required
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bairro</label>
                  <input
                    type="text"
                    value={novoEndereco.bairro}
                    onChange={(e) => setNovoEndereco({ ...novoEndereco, bairro: e.target.value })}
                    required
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Complemento (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Apt, Bloco..."
                    value={novoEndereco.complemento}
                    onChange={(e) => setNovoEndereco({ ...novoEndereco, complemento: e.target.value })}
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={salvandoEndereco}
                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white font-black text-sm py-3 px-8 rounded-xl transition-colors cursor-pointer disabled:bg-gray-400 mt-2"
              >
                {salvandoEndereco ? 'Salvando...' : 'Salvar Endereço'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Endereços Cadastrados</h4>
            {loadingEnderecos ? (
              <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
            ) : enderecos.length === 0 ? (
              <p className="text-gray-500 bg-white p-5 rounded-2xl border border-gray-200 text-sm font-medium">Nenhum endereço cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enderecos.map((end) => (
                  <div key={end.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start group">
                    <div>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md mb-2 inline-block">
                        {end.titulo}
                      </span>
                      <p className="font-bold text-gray-800 text-sm md:text-base">{end.rua}, {end.numero}</p>
                      {end.complemento && <p className="text-sm text-gray-500 font-medium">{end.complemento}</p>}
                      <p className="text-sm text-gray-500 font-medium">{end.bairro} - {end.cidade}</p>
                      <p className="text-xs text-gray-400 mt-2 font-mono">CEP: {end.cep}</p>
                    </div>
                    <button
                      onClick={() => handleRemoverEndereco(end.id)}
                      className="text-gray-300 hover:text-red-500 p-2 cursor-pointer transition-colors bg-gray-50 rounded-xl"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: MEUS FAVORITOS */}
      {abaAtiva === 'favoritos' && (
        <div className="space-y-6">
          <h3 className="text-base md:text-lg font-black text-gray-800 flex items-center gap-2">
            <Heart size={20} className="text-red-500" /> Lista de Desejos
          </h3>
          
          {loadingFavoritos ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div></div>
          ) : produtosFavoritos.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-gray-200 text-gray-500 shadow-sm">
              <Heart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-bold text-gray-700">Você ainda não favoritou nenhum produto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {produtosFavoritos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}