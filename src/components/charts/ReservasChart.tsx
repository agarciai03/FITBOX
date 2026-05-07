import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReservasData {
    mes: string;
    reservas: number;
}

interface ReservasChartProps {
    data: ReservasData[];
}

export const ReservasChart = ({ data }: ReservasChartProps) => {
    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="mes" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#16181d', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#dc2626', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${value} Plazas reservadas`, 'Tráfico']}
                    />
                    <Area type="monotone" dataKey="reservas" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorReservas)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};