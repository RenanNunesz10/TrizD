import { useState } from 'react';
import { Calculator, Box, Zap, Settings, Tag } from 'lucide-react';

export default function Calculadora() {
  const [calcPeso, setCalcPeso] = useState(50); 
  const [calcPrecoMaterial, setCalcPrecoMaterial] = useState(120); 
  const [calcTempo, setCalcTempo] = useState(4); 
  const [calcEnergia, setCalcEnergia] = useState(0.95); 
  const [calcPotencia, setCalcPotencia] = useState(150); 
  const [calcDesgaste, setCalcDesgaste] = useState(1.50); 
  const [calcMargem, setCalcMargem] = useState(150); 

  const custoMaterial = (calcPrecoMaterial / 1000) * calcPeso;
  const consumoKwh = (calcPotencia / 1000) * calcTempo;
  const custoEnergia = consumoKwh * calcEnergia;
  const custoMaquina = calcDesgaste * calcTempo;
  const custoTotal = custoMaterial + custoEnergia + custoMaquina;
  const precoSugerido = custoTotal * (1 + (calcMargem / 100));
  const lucroReal = precoSugerido - custoTotal;

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-black tracking-tight">Inteligência de Precificação 3D</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3"><Box size={16}/> Material</h4>
              <div className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Peso da peça (g)</label><input type="number" value={calcPeso} onChange={e => setCalcPeso(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none"/></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Preço do Carretel (R$/kg)</label><input type="number" value={calcPrecoMaterial} onChange={e => setCalcPrecoMaterial(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none"/></div>
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3"><Zap size={16}/> Energia & Tempo</h4>
              <div className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Tempo de Impressão (Horas)</label><input type="number" step="0.5" value={calcTempo} onChange={e => setCalcTempo(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none"/></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">R$ / kWh</label><input type="number" step="0.01" value={calcEnergia} onChange={e => setCalcEnergia(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none"/></div>
                  <div><label className="block text-xs font-bold text-slate-600 mb-1">Watts (Imp.)</label><input type="number" value={calcPotencia} onChange={e => setCalcPotencia(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none"/></div>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3"><Settings size={16}/> Máquina & Margem</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Taxa de Desgaste (R$ / Hora)</label><input type="number" step="0.1" value={calcDesgaste} onChange={e => setCalcDesgaste(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none"/></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Margem de Lucro Desejada (%)</label><input type="number" value={calcMargem} onChange={e => setCalcMargem(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none"/></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-3xl shadow-lg p-8 text-white h-fit sticky top-24">
          <h3 className="text-lg font-black flex items-center gap-2 mb-6"><Tag className="text-blue-400" size={20}/> Resumo de Custos</h3>
          <div className="space-y-4 mb-8 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-white/10"><span className="text-slate-400">Material:</span><span className="font-bold">R$ {custoMaterial.toFixed(2)}</span></div>
            <div className="flex justify-between items-center pb-3 border-b border-white/10"><span className="text-slate-400">Energia:</span><span className="font-bold">R$ {custoEnergia.toFixed(2)}</span></div>
            <div className="flex justify-between items-center pb-3 border-b border-white/10"><span className="text-slate-400">Desgaste/Máquina:</span><span className="font-bold">R$ {custoMaquina.toFixed(2)}</span></div>
            <div className="flex justify-between items-center pt-2"><span className="text-slate-300 font-bold">CUSTO TOTAL:</span><span className="text-xl font-black text-amber-400">R$ {custoTotal.toFixed(2)}</span></div>
          </div>
          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 text-center">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Preço Sugerido</p>
            <h2 className="text-4xl font-black text-green-400 mb-2">R$ {precoSugerido.toFixed(2)}</h2>
            <p className="text-xs text-slate-400 font-medium">Lucro real: <span className="text-white font-bold">R$ {lucroReal.toFixed(2)}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}