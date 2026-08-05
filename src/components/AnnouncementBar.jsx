import { ShieldCheck, Truck, Zap } from 'lucide-react';

export default function AnnouncementBar() {
  // 1. Definimos as 3 mensagens originais
  const baseMensagens = [
    { texto: "GARANTIA DE 1 ANO", icone: ShieldCheck },
    { texto: "FRETE FIXO R$ 15,00", icone: Truck },
    { texto: "QUALIDADE PREMIUM EM 3D", icone: Zap },
  ];

  // 2. Multiplicamos elas 10 VEZES para garantir que preencham qualquer monitor (até TV 4K)
  const mensagens = Array(10).fill(baseMensagens).flat();

  return (
    <div className="bg-blue-600 text-white overflow-hidden whitespace-nowrap py-2 relative flex items-center z-50">
      
      {/* Container que desliza até -50% */}
      <div className="flex w-max animate-marquee hover:pause">
        
        {/* BLOCO A - Primeira Metade (Gigante) */}
        <div className="flex min-w-max shrink-0 items-center gap-8 px-4">
          {mensagens.map((msg, index) => {
            const Icone = msg.icone;
            return (
              <span key={`a-${index}`} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <Icone size={16} className="text-blue-300" /> {msg.texto}
              </span>
            );
          })}
        </div>

        {/* BLOCO B - Segunda Metade (Cópia Exata para o looping perfeito) */}
        <div className="flex min-w-max shrink-0 items-center gap-8 px-4">
          {mensagens.map((msg, index) => {
            const Icone = msg.icone;
            return (
              <span key={`b-${index}`} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <Icone size={16} className="text-blue-300" /> {msg.texto}
              </span>
            );
          })}
        </div>

      </div>
    </div>
  );
}