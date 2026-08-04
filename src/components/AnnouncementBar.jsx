import { ShieldCheck, Truck, Zap } from 'lucide-react';

export default function AnnouncementBar() {
  // Você pode alterar as mensagens e ícones aqui
  const mensagens = [
    { texto: "GARANTIA DE 1 ANO", icone: ShieldCheck },
    { texto: "FRETE FIXO R$ 15,00", icone: Truck },
    { texto: "QUALIDADE PREMIUM EM 3D", icone: Zap },
    { texto: "GARANTIA DE 1 ANO", icone: ShieldCheck },
    { texto: "FRETE FIXO R$ 15,00", icone: Truck },
    { texto: "QUALIDADE PREMIUM EM 3D", icone: Zap },
  ];

  return (
    <div className="bg-blue-600 text-white overflow-hidden whitespace-nowrap py-2.5 relative flex items-center z-50">
      
      {/* O container que vai deslizar */}
      <div className="flex animate-marquee min-w-full hover:pause">
        
        {/* Bloco 1 (Original) */}
        <div className="flex items-center justify-around w-full shrink-0 gap-8 px-4">
          {mensagens.map((msg, index) => {
            const Icone = msg.icone;
            return (
              <span key={index} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <Icone size={16} className="text-emerald-300" /> {msg.texto}
              </span>
            );
          })}
        </div>

        {/* Bloco 2 (Cópia exata para criar o loop perfeito) */}
        <div className="flex items-center justify-around w-full shrink-0 gap-8 px-4">
          {mensagens.map((msg, index) => {
            const Icone = msg.icone;
            return (
              <span key={`copia-${index}`} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <Icone size={16} className="text-emerald-300" /> {msg.texto}
              </span>
            );
          })}
        </div>

      </div>
    </div>
  );
}