import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Printer, CheckCircle2, Clock, Search, Send, RefreshCw, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, perfil, carregando } = useAuthStore();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [busca, setBusca] = useState('');

  // Estado temporário para edição do código de rastreio { [pedidoId]: codigo }
  const [codigosRastreio, setCodigosRastreio] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);

  const listaStatus = [
    'Aguardando Pagamento',
    'Em Impressão 3D',
    'Acabamento & Pintura',
    'Enviado',
    'Entregue'
  ];

  // Carrega os pedidos do banco
  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, itens_pedido(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPedidos(data || []);

      // Preenche o estado inicial de rastreios
      const rastreiosIniciais = {};
      data?.forEach((p) => {
        rastreiosIniciais[p.id] = p.codigo_rastreio || '';
      });
      setCodigosRastreio(rastreiosIniciais);

    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      toast.error('Erro ao carregar lista de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!carregando) {
      if (!user || perfil?.role !== 'admin') {
        return; // Exibe a tela de acesso negado abaixo
      }
      fetchPedidos();
    }
  }, [user, perfil, carregando]);

  // Alterar Status do Pedido
  const handleAlterarStatus = async (pedidoId, novoStatus) => {
    setSalvandoId(pedidoId);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: novoStatus })
        .eq('id', pedidoId);

      if (error) throw error;

      toast.success(`Status alterado para "${novoStatus}"!`);
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p))
      );
    } catch (err) {
      toast.error('Erro ao alterar status.');
      console.error(err);
    } finally {
      setSalvandoId(null);
    }
  };

  // Salvar Código de Rastreio
  const handleSalvarRastreio = async (pedidoId) => {
    const codigo = codigosRastreio[pedidoId];
    setSalvandoId(pedidoId);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ codigo_rastreio: codigo })
        .eq('id', pedidoId);

      if (error) throw error;

      toast.success('Código de rastreio atualizado!');
    } catch (err) {
      toast.error('Erro ao salvar código de rastreio.');
      console.error(err);
    } finally {
      setSalvandoId(null);
    }
  };

  // Proteção de Rota
  if (carregando) {
    return <div className="text-center py-20 text-gray-500 font-medium">Verificando permissões...</div>;
  }

  if (!user || perfil?.role !== 'admin') {
    return (
      <div className="text-center py-20 bg-white rounded-lg border border-gray-200 max-w-lg mx-auto p-8 shadow-sm">
        <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito ao Administrador</h2>
        <p className="text-gray-600 mb-6 text-sm">Você precisa estar logado com uma conta de Administrador para acessar esta página.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
          Voltar para a Loja
        </button>
      </div>
    );
  }

  // Filtragem dos Pedidos
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const combinaStatus = filtroStatus === 'Todos' || pedido.status === filtroStatus;
    const combinaBusca =
      pedido.id.toLowerCase().includes(busca.toLowerCase()) ||
      pedido.endereco_entrega.toLowerCase().includes(busca.toLowerCase());
    return combinaStatus && combinaBusca;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 text-white p-6 rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Printer className="text-blue-400" /> Painel de Gestão de Pedidos
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Controle a fila de impressão, altere status e envie códigos de rastreio.
          </p>
        </div>
        <button
          onClick={fetchPedidos}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-sm font-semibold py-2 px-4 rounded border border-gray-700 transition cursor-pointer"
        >
          <RefreshCw size={16} /> Atualizar Lista
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Filtro por Status */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['Todos', ...listaStatus].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-full font-medium text-xs whitespace-nowrap cursor-pointer transition-colors ${
                filtroStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Busca por ID ou Endereço */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por código ou endereço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>

      </div>

      {/* Lista de Pedidos */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando fila de pedidos...</div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 text-gray-500">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div className="space-y-6">
          {pedidosFiltrados.map((pedido) => (
            <div key={pedido.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
              
              {/* Informações Principais do Pedido */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold">
                      #{pedido.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(pedido.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong className="text-gray-800">Entrega:</strong> {pedido.endereco_entrega}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-xs text-gray-400 block uppercase font-bold">Valor Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Itens Solicitados na Fila de Impressão */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Peças para Produzir:
                </h4>
                <ul className="divide-y divide-gray-200 text-sm">
                  {pedido.itens_pedido?.map((item) => (
                    <li key={item.id} className="py-1.5 flex justify-between">
                      <span className="font-semibold text-gray-800">{item.nome_produto}</span>
                      <span className="text-gray-500">
                        R$ {Number(item.preco_unitario).toFixed(2).replace('.', ',')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Controle de Status & Código de Rastreio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Alterar Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Status Atual da Impressão / Envio:
                  </label>
                  <select
                    value={pedido.status}
                    disabled={salvandoId === pedido.id}
                    onChange={(e) => handleAlterarStatus(pedido.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded font-semibold text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {listaStatus.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Código de Rastreio */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Código de Rastreio dos Correios:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: AA123456789BR"
                      value={codigosRastreio[pedido.id] || ''}
                      onChange={(e) =>
                        setCodigosRastreio({ ...codigosRastreio, [pedido.id]: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={() => handleSalvarRastreio(pedido.id)}
                      disabled={salvandoId === pedido.id}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-4 rounded transition flex items-center gap-1 cursor-pointer disabled:bg-gray-400"
                    >
                      <Send size={14} /> Salvar
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}