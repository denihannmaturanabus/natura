
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from '../components/Layout';
import { db } from '../services/supabase';
import { Planilla, Pedido } from '../types';

interface StatsProps {
  empresa: 'natura' | 'esika';
  onBack: () => void;
}

const Stats: React.FC<StatsProps> = ({ empresa, onBack }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allPlanillas = await db.getPlanillas();
      const planillas = allPlanillas.filter(p => p.empresa === empresa);
      const chartData = await Promise.all(planillas.map(async (p) => {
        const pedidos = await db.getPedidos(p.id);
        const total = pedidos.reduce((acc, curr) => {
          const totalPedido = curr.productos.reduce((sum, prod) => sum + (prod.monto || 0), 0);
          return acc + totalPedido;
        }, 0);
        const profit = (total * p.comision_porcentaje) / 100;
        return {
          name: p.nombre.split(' ')[1] || p.nombre.substring(0, 5),
          ganancia: Math.round(profit),
          total: total
        };
      }));
      setData(chartData.reverse());
    };
    fetchData();
  }, []);

  const totalAcumulado = data.reduce((acc, curr) => acc + curr.ganancia, 0);

  return (
    <Layout empresa={empresa} showBack onBack={onBack} title="Estadísticas">
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-[2.5rem] p-8 text-white shadow-xl shadow-pink-200">
          <p className="text-pink-100 font-bold text-sm uppercase tracking-widest mb-2">Ganancia Total 2024</p>
          <h2 className="text-4xl font-black">${totalAcumulado.toLocaleString()}</h2>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase">Ciclos</p>
              <p className="text-lg font-bold">{data.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-50">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Ganancia por Ciclo</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#FF8FAB' : '#FFD6E0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 px-2">Resumen de Ciclos</h3>
          {data.map((d, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-pink-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{d.name}</p>
                <p className="text-xs text-gray-400">Vendido: ${d.total.toLocaleString()}</p>
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
