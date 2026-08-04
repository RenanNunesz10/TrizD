import { Outlet, Link, useLocation } from 'react-router-dom';
import { Printer, LayoutDashboard, Database, Box, Calculator, ShieldAlert, Truck, Tag } from 'lucide-react'; // <-- Importamos o Truck
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const { user, perfil, carregando } = useAuthStore();
  const location = useLocation();

  if (carregando) return <div className="text-center py-20 text-slate-500">Carregando painel...</div>;
  if (!user || perfil?.role !== 'admin') return <div className="text-center py-20"><ShieldAlert size={48} className="mx-auto text-red-500"/><h2>Acesso Negado</h2></div>;

  const navItens = [
    { path: '/admin', icone: LayoutDashboard, label: 'Visão Geral' },
    { path: '/admin/pedidos', icone: Truck, label: 'Gestão de Pedidos' }, // <-- NOVO BOTÃO
    { path: '/admin/promocoes', icone: Tag, label: 'Ofertas & Cupons' },
    { path: '/admin/estoque', icone: Database, label: 'Controle de Estoque' },
    { path: '/admin/produtos', icone: Box, label: 'Catálogo de Produtos' },
    { path: '/admin/calculadora', icone: Calculator, label: 'Calculadora de Custos' },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-70px)] bg-slate-50">
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 hidden md:block">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Printer className="text-blue-600" size={28} /> 3D<span className="text-blue-600">Admin</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible custom-scrollbar">
          {navItens.map((item) => {
            const ativo = location.pathname === item.path;
            const Icone = item.icone;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${ativo ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Icone size={20}/> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 w-full min-w-0 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}