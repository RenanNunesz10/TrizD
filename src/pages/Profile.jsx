import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, Printer, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user, perfil } = useAuthStore();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Etapas do processo de impressão 3D e entrega
  const etapasStatus = [
    { label: 'Aguardando Pagamento', icon: Clock },
    { label: 'Em Impressão 3D', icon: Printer },
    { label: 'Acabamento & Pintura', icon: Package },
    { label: 'Enviado', icon: Truck },
    { label: 'Entregue', icon: CheckCircle2 },
  ];

  useEffect(() => {
    async function fetchMeusPedidos() {
      if (!user) return;
      try {
        setLoading(true);
        
        // Busca os pedidos e junta com os itens vinculados
        const { data, error } = await supabase
          .from('pedidos')
          .select('*, itens_pedido(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) console.error('Erro ao buscar pedidos:', error);
        else setPedidos(data || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMeusPedidos();
  }, [user]);

  const getEtapaIndex = (status) => {
    return etapasStatus.findIndex((e) => e.label === status);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Cabeçalho do Perfil */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{perfil?.nome || 'Cliente'}</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Package size={24} className="text-blue-600" />
          Meus Pedidos & Rastreamento
        </h3>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando seus pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500">
            Você ainda não fez nenhum pedido.
          </div>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => {
              const etapaAtual = getEtapaIndex(pedido.status);

              return (
                <div key={pedido.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                  
                  {/* Info Topo do Pedido */}
                  <div className="flex flex-col sm:flex-row justify-between border-b pb-4 gap-2">
                    <div>
                      <span className="text-xs text-gray-400 font-mono">PEDIDO #{pedido.id.slice(0, 8)}</span>
                      <p className="text-sm text-gray-500">
                        Data: {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="font-bold text-lg text-blue-600">
                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                      </span>
                      {pedido.codigo_rastreio && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          Rastreio: {pedido.codigo_rastreio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Linha do Tempo / Acompanhamento de Status */}
                  <div className="py-4">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Status da Produção:</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {etapasStatus.map((etapa, idx) => {
                        const Icon = etapa.icon;
                        const concluida = idx <= etapaAtual;

                        return (
                          <div 
                            key={etapa.label} 
                            className={`p-3 rounded-lg border flex flex-col items-center text-center transition-colors ${
                              concluida 
                                ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' 
                                : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`}
                          >
                            <Icon size={22} className="mb-2" />
                            <span className="text-xs">{etapa.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Itens Comprados */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Itens do Pedido:</h4>
                    <ul className="divide-y divide-gray-200 text-sm">
                      {pedido.itens_pedido?.map((item) => (
                        <li key={item.id} className="py-2 flex justify-between">
                          <span className="text-gray-800">{item.nome_produto}</span>
                          <span className="font-semibold text-gray-600">
                            R$ {Number(item.preco_unitario).toFixed(2).replace('.', ',')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}