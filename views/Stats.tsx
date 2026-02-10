
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from '../components/Layout';
import { db } from '../services/supabase';
import { Planilla, Pedido } from '../types';

interface StatsProps {
  empresa: 'natura' | 'esika';
  onBack: () => void;
}

type FiltroEmpresa = 'natura' | 'esika' | 'ambas';

const Stats: React.FC<StatsProps> = ({ empresa, onBack }) => {
  const [filtro, setFiltro] = useState<FiltroEmpresa>('ambas');
  const [data, setData] = useState<any[]>([]);
  const [statsNatura, setStatsNatura] = useState({ total: 0, ganancia: 0, ciclos: 0 });
  const [statsEsika, setStatsEsika] = useState({ total: 0, ganancia: 0, ciclos: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const allPlanillas = await db.getPlanillas();
      
      // Calcular stats por empresa
      const planillasNatura = allPlanillas.filter(p => p.empresa === 'natura');
      const planillasEsika = allPlanillas.filter(p => p.empresa === 'esika');
      
      // Stats Natura
      let totalNatura = 0;
      let gananciaNatura = 0;
      const dataNatura = await Promise.all(planillasNatura.map(async (p) => {
        const pedidos = await db.getPedidos(p.id);
        const total = pedidos.reduce((acc, curr) => {
          const totalPedido = curr.productos.reduce((sum, prod) => sum + (prod.monto || 0), 0);
          return acc + totalPedido;
        }, 0);
        const profit = (total * p.comision_porcentaje) / 100;
        totalNatura += total;
        gananciaNatura += profit;
        return {
          name: p.nombre.split(' ')[1] || p.nombre.substring(0, 5),
          ganancia: Math.round(profit),
          total: total,
          empresa: 'natura'
        };
      }));
      
      // Stats Ésika
      let totalEsika = 0;
      let gananciaEsika = 0;
      const dataEsika = await Promise.all(planillasEsika.map(async (p) => {
        const pedidos = await db.getPedidos(p.id);
        const total = pedidos.reduce((acc, curr) => {
          const totalPedido = curr.productos.reduce((sum, prod) => sum + (prod.monto || 0), 0);
          return acc + totalPedido;
        }, 0);
        const profit = (total * p.comision_porcentaje) / 100;
        totalEsika += total;
        gananciaEsika += profit;
        return {
          name: p.nombre.split(' ')[1] || p.nombre.substring(0, 5),
          ganancia: Math.round(profit),
          total: total,
          empresa: 'esika'
        };
      }));
      
      setStatsNatura({ total: totalNatura, ganancia: Math.round(gananciaNatura), ciclos: planillasNatura.length });
      setStatsEsika({ total: totalEsika, ganancia: Math.round(gananciaEsika), ciclos: planillasEsika.length });
      
      // Combinar datos según filtro
      const allData = [...dataNatura, ...dataEsika].reverse();
      setData(allData);
    };
    fetchData();
  }, []);

  // Filtrar datos según selección
  const dataFiltrada = filtro === 'ambas' 
    ? data 
    : data.filter(d => d.empresa === filtro);
  
  const totalAcumulado = dataFiltrada.reduce((acc, curr) => acc + curr.ganancia, 0);
  const totalVendidoFiltrado = dataFiltrada.reduce((acc, curr) => acc + curr.total, 0);
  
  const empresaActual = filtro === 'natura' ? 'natura' : filtro === 'esika' ? 'esika' : empresa;

  return (
    <Layout empresa={empresaActual} showBack onBack={onBack} title="Estadísticas">
      <div className="space-y-6">
        {/* Selector de Filtro */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => setFiltro('natura')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              filtro === 'natura' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Natura
          </button>
          <button
            onClick={() => setFiltro('esika')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              filtro === 'esika' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Ésika
          </button>
          <button
            onClick={() => setFiltro('ambas')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              filtro === 'ambas' 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Ambas
          </button>
        </div>

        {/* Estadísticas por Empresa (solo cuando filtro = ambas) */}
        {filtro === 'ambas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Natura */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <img src="/img/logo_natura.png" alt="Natura" className="h-8 object-contain" />
              </div>
              <p className="text-pink-100 font-bold text-xs uppercase tracking-widest mb-1">Total Vendido</p>
              <h3 className="text-2xl font-black mb-3">${statsNatura.total.toLocaleString()}</h3>
              <div className="flex items-center justify-between pt-3 border-t border-pink-400/30">
                <div>
                  <p className="text-pink-100 text-xs font-semibold">Ganancia</p>
                  <p className="text-xl font-black">${statsNatura.ganancia.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-pink-100 text-xs font-semibold">Ciclos</p>
                  <p className="text-xl font-black">{statsNatura.ciclos}</p>
                </div>
              </div>
            </div>

            {/* Ésika */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <img src="/img/logo_esika.png" alt="Ésika" className="h-8 object-contain" />
              </div>
              <p className="text-cyan-100 font-bold text-xs uppercase tracking-widest mb-1">Total Vendido</p>
              <h3 className="text-2xl font-black mb-3">${statsEsika.total.toLocaleString()}</h3>
              <div className="flex items-center justify-between pt-3 border-t border-cyan-400/30">
                <div>
                  <p className="text-cyan-100 text-xs font-semibold">Ganancia</p>
                  <p className="text-xl font-black">${statsEsika.ganancia.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-cyan-100 text-xs font-semibold">Ciclos</p>
                  <p className="text-xl font-black">{statsEsika.ciclos}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumen General */}
        <div className={`rounded-[2.5rem] p-8 text-white shadow-xl ${
          filtro === 'natura' ? 'bg-gradient-to-br from-pink-500 to-rose-400 shadow-pink-200' :
          filtro === 'esika' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-blue-200' :
          'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-200'
        }`}>
          <p className="text-white/80 font-bold text-sm uppercase tracking-widest mb-2">
            {filtro === 'ambas' ? 'Ganancia Total' : `Ganancia ${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`}
          </p>
          <h2 className="text-4xl font-black">${totalAcumulado.toLocaleString()}</h2>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase">Total Vendido</p>
              <p className="text-lg font-bold">${totalVendidoFiltrado.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase">Ciclos</p>
              <p className="text-lg font-bold">{dataFiltrada.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-50">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Ganancia por Ciclo</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataFiltrada}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FDF2F4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#FFF5F7' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ganancia" radius={[10, 10, 10, 10]}>
                  {dataFiltrada.map((entry, index) => {
                    let color = '#FF8FAB'; // Natura por defecto
                    if (filtro === 'esika') color = '#06B6D4'; // Cyan para Ésika
                    else if (filtro === 'ambas') {
                      color = entry.empresa === 'natura' ? '#FF8FAB' : '#06B6D4';
                    }
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 px-2">Resumen de Ciclos</h3>
          {dataFiltrada.map((d, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-pink-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {filtro === 'ambas' && (
                  <div className={`w-3 h-3 rounded-full ${d.empresa === 'natura' ? 'bg-pink-500' : 'bg-cyan-500'}`}></div>
                )}
                <div>
                  <p className="font-bold text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-400">Vendido: ${d.total.toLocaleString()}</p>
                </div>
              </div>
              <p className="font-black text-green-500 text-lg">+${d.ganancia.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Stats;
