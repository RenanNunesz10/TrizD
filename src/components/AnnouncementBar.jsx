import { ShieldCheck, Truck, Zap } from 'lucide-react';

export default function AnnouncementBar() {
  const mensagens = [
    { texto: "GARANTIA DE 1 ANO", icone: ShieldCheck },
    { texto: "FRETE FIXO R$ 15,00", icone: Truck },
    { texto: "QUALIDADE PREMIUM EM 3D", icone: Zap },
  ];

  return (
    <div className="bg-blue-600 text-white overflow-hidden whitespace-nowrap py-2 relative flex items-center z-50">
      <div className="flex animate-marquee hover:pause">
        
        {/* Adicionamos min-w-max e shrink-0 para impedir o esmagamento */}
        <div className="flex min-w-max shrink-0 items-center justify-around gap-8 px-8">
          {mensagens.map((msg, index) => {
            const Icone = msg.icone;
            return (
              <span key={index} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <Icone size={16} className="text-blue-300" /> {msg.texto}
              </span>
            );
          })}
        </div>

        <div className="flex min-w-max shrink-0 items-center justify-around gap-8 px-8">
          {mensagens.map((msg, index) => {
            const Icone = msg.icone;
            return (
              <span key={`copia-${index}`} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <Icone size={16} className="text-blue-300" /> {msg.texto}
              </span>
            );
          })}
        </div>

        {/* 3º Bloco para garantir que não haja "buracos" na rolagem em telas maiores */}
        <div className="flex min-w-max shrink-0 items-center justify-around gap-8 px-8">
          {mensagens.map((msg, index) => {
            const Icone = msg.icone;
            return (
              <span key={`copia2-${index}`} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <Icone size={16} className="text-blue-300" /> {msg.texto}
              </span>
            );
          })}
        </div>

      </div>
    </div>
  );
}