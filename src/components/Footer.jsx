import { Link } from 'react-router-dom';
// Removemos o Instagram da importação abaixo!
import { Phone, Mail, MapPin, CreditCard, QrCode, Barcode, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <>
      {/* Botão Flutuante do WhatsApp */}
      <a 
        href="https://wa.me/5511999999999" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-[80px] md:bottom-8 right-4 md:right-8 bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-lg hover:scale-110 hover:-translate-y-1 transition-all z-40 cursor-pointer"
        title="Fale conosco no WhatsApp"
      >
        <MessageCircle size={28} />
      </a>

      {/* RODAPÉ PRINCIPAL */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-28 md:pb-12 border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Topo do Rodapé: 3 Colunas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Coluna 1: Departamentos */}
            <div className="space-y-4">
              <h3 className="text-white text-lg font-black tracking-wider uppercase mb-6">Departamentos</h3>
              <ul className="space-y-3 font-medium text-sm">
                <li><Link to="/" className="hover:text-blue-400 transition-colors">Início</Link></li>
                <li><a href="#vitrine" className="hover:text-blue-400 transition-colors">Catálogo de Produtos</a></li>
                <li><Link to="/perfil" className="hover:text-blue-400 transition-colors">Meus Pedidos</Link></li>
                <li><Link to="/" className="hover:text-blue-400 transition-colors">Quem Somos</Link></li>
                <li><Link to="/" className="hover:text-blue-400 transition-colors">Políticas de Reembolso</Link></li>
              </ul>
            </div>

            {/* Coluna 2: Entre em contato */}
            <div className="space-y-4">
              <h3 className="text-white text-lg font-black tracking-wider uppercase mb-6">Entre em contato</h3>
              <ul className="space-y-4 font-medium text-sm">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-blue-500 shrink-0" />
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                    (11) 99999-9999
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-blue-500 shrink-0" />
                  <a href="mailto:contato@trizd.com.br" className="hover:text-blue-400 transition-colors">
                    contato@trizd.com.br
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={18} className="text-blue-500 shrink-0" />
                  <span>São Paulo - SP</span>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Permaneça conectado */}
            <div className="space-y-4">
              <h3 className="text-white text-lg font-black tracking-wider uppercase mb-6">Permaneça conectado</h3>
              <div className="flex gap-4">
                {/* Ícones do Instagram e Facebook removidos. Colocamos apenas um texto temporário. */}
                <span className="bg-slate-800 px-4 py-2 rounded-full font-bold text-blue-400 hover:text-white transition-colors cursor-pointer">
                  @trizd_3d
                </span>
              </div>
              <p className="text-sm mt-4 text-slate-400 leading-relaxed max-w-xs">
                Siga nossas redes sociais para acompanhar as novidades e lançamentos de peças exclusivas em 3D.
              </p>
            </div>

          </div>

          {/* Divisória */}
          <div className="border-t border-slate-800 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Meios de Pagamento */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-white font-bold uppercase tracking-wider text-sm">Meios de pagamento</span>
              <div className="flex gap-2">
                <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center" title="Cartão de Crédito">
                  <CreditCard size={24} className="text-slate-200" />
                </div>
                <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center" title="PIX">
                  <QrCode size={24} className="text-teal-400" />
                </div>
                <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center" title="Boleto">
                  <Barcode size={24} className="text-slate-200" />
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right text-xs text-slate-500 font-medium">
              <p>Copyright TrizD - Peças Impressas em 3D - 00.000.000/0001-00</p>
              <p className="mt-1">© 2026. Todos os direitos reservados.</p>
            </div>

          </div>

        </div>
      </footer>
    </>
  );
}