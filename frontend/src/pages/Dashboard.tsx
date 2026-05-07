import { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

export default function Dashboard({ currentUser }: { currentUser: string | null }) {
  const [rawData, setRawData] = useState<any>(null);
  const [period, setPeriod] = useState<'day' | 'month' | 'total'>('day');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const result = await api.getDashboard(currentUser || undefined);
      setRawData(result);
    } catch (e: any) {
      console.error("Erro ao carregar Dashboard:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentUser]);

  if (loading || !rawData) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="loader"></div>
      <p className="ml-3 text-muted">Carregando métricas...</p>
    </div>
  );

  const currentData = rawData[period];

  // Cálculos de resumo
  let totalEntregas = 0;
  let totalColetas = 0;
  let totalServicos = 0;
  
  currentData.types?.forEach((op: any) => {
      if (op.operation_type === 'entrega') totalEntregas = op.count;
      if (op.operation_type === 'coleta') totalColetas = op.count;
      if (op.operation_type === 'servico') totalServicos = op.count;
  });

  const totalGeral = totalEntregas + totalColetas + totalServicos;

  // Dados para o gráfico principal
  const chartData = period === 'day' 
    ? Array.from({ length: 24 }, (_, i) => {
        const h = i.toString().padStart(2, '0');
        const match = currentData.peak?.find((p: any) => p.hour === h);
        return { name: `${h}h`, valor: match ? match.count : 0 };
      })
    : (currentData.history?.map((h: any) => ({
        name: h.date.split('-').reverse().slice(0, 2).join('/'),
        valor: h.count
      })) || []);

  // Dados para o gráfico de pizza (Distribuição)
  const pieData = [
    { name: 'Entregas', value: totalEntregas, color: '#3b82f6' },
    { name: 'Coletas', value: totalColetas, color: '#10b981' },
    { name: 'Serviços', value: totalServicos, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  // Dados para Gráfico de Horários de Pico (sempre baseado no período selecionado)
  const peakData = Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, '0');
    const match = currentData.peak?.find((p: any) => p.hour === h);
    return { hour: `${h}h`, count: match ? match.count : 0 };
  });

  return (
    <section className="tab-section active">
      <div className="section-header flex-between align-center">
        <div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-dark)' }}>Dashboard Operacional</h3>
          <p className="text-muted">Análise de fluxo e produtividade das docas.</p>
        </div>
        
        <div className="period-switcher glass-card">
          <button 
            className={period === 'day' ? 'active' : ''} 
            onClick={() => setPeriod('day')}
          >Hoje</button>
          <button 
            className={period === 'month' ? 'active' : ''} 
            onClick={() => setPeriod('month')}
          >Mês</button>
          <button 
            className={period === 'total' ? 'active' : ''} 
            onClick={() => setPeriod('total')}
          >Total</button>
        </div>
      </div>

      <div className="dash-grid-v2 mt-4">
        {/* Top Cards */}
        <div className="card-v2 primary-card shadow-lg">
          <div className="flex-between">
            <span className="card-label">Volume Total</span>
          </div>
          <h2 className="card-value">{totalGeral}</h2>
          <p className="card-sub">Operações registradas no período</p>
        </div>

        <div className="card-v2 white-card">
          <div className="flex-between">
            <span className="card-label">Entregas</span>
            <div className="dot blue"></div>
          </div>
          <h2 className="card-value">{totalEntregas}</h2>
          <p className="card-sub">Cargas recebidas</p>
        </div>

        <div className="card-v2 white-card">
          <div className="flex-between">
            <span className="card-label">Coletas</span>
            <div className="dot green"></div>
          </div>
          <h2 className="card-value">{totalColetas}</h2>
          <p className="card-sub">Cargas enviadas</p>
        </div>

        <div className="card-v2 white-card">
          <div className="flex-between">
            <span className="card-label">Serviços</span>
            <div className="dot orange"></div>
          </div>
          <h2 className="card-value">{totalServicos}</h2>
          <p className="card-sub">Manutenção / Outros</p>
        </div>

        {/* Main Flow Chart */}
        <div className="card-v2 white-card col-span-3 h-400">
          <div className="flex-between mb-4">
            <h4 className="card-title-v2">
              {period === 'day' ? 'Fluxo Diário (por hora)' : 'Evolução Temporal'}
            </h4>
            <div className="flex gap-2">
               <span className="legend-item"><span className="dot gray"></span> Volume de Registros</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="valor" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-v2 white-card col-span-1 h-400">
          <h4 className="card-title-v2 mb-4">Distribuição</h4>
          <ResponsiveContainer width="100%" height="60%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend mt-4">
             {pieData.map((d, i) => (
               <div key={i} className="flex-between mb-2">
                 <span className="flex align-center gap-2"><div className="dot" style={{background: d.color}}></div> {d.name}</span>
                 <span style={{fontWeight: 600}}>{Math.round((d.value / totalGeral) * 100) || 0}%</span>
               </div>
             ))}
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="card-v2 white-card col-span-2 h-350">
           <h4 className="card-title-v2 mb-4">Horários de Pico (Média de Fluxo)</h4>
           <ResponsiveContainer width="100%" height="80%">
             <BarChart data={peakData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
               <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
               <YAxis hide />
               <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
               <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>

        {/* Top Lists */}
        <div className="card-v2 white-card col-span-1 h-350">
           <h4 className="card-title-v2 mb-4">Top Lojas</h4>
           <div className="modern-list-v2">
              {currentData.stores?.slice(0, 4).map((s: any, i: number) => (
                <div className="list-item-v2" key={i}>
                  <div className="flex align-center gap-2">
                    <div className="store-avatar" style={{width: '28px', height: '28px', fontSize: '0.7rem'}}>{s.store_name[0]}</div>
                    <p className="item-main" style={{fontSize: '0.85rem'}}>{s.store_name}</p>
                  </div>
                  <span className="item-value" style={{fontSize: '0.85rem'}}>{s.count}</span>
                </div>
              ))}
              {currentData.stores?.length === 0 && <p className="text-muted text-center p-4">Nenhum registro.</p>}
           </div>
        </div>

        <div className="card-v2 white-card col-span-1 h-350">
           <h4 className="card-title-v2 mb-4">Top Operadores</h4>
           <div className="modern-list-v2">
              {currentData.operators?.slice(0, 4).map((op: any, i: number) => (
                <div className="list-item-v2" key={i}>
                  <div className="flex align-center gap-2">
                    <div className="operator-avatar" style={{width: '28px', height: '28px', fontSize: '0.7rem'}}>{op.operator_name[0]}</div>
                    <p className="item-main" style={{fontSize: '0.85rem'}}>{op.operator_name}</p>
                  </div>
                  <span className="item-value" style={{fontSize: '0.85rem'}}>{op.count}</span>
                </div>
              ))}
              {currentData.operators?.length === 0 && <p className="text-muted text-center p-4">Nenhum registro.</p>}
           </div>
        </div>
      </div>
    </section>
  );
}
