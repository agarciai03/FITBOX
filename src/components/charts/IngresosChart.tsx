import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IngresosData {
    mes: string;
    ingresos: number;
}

interface IngresosChartProps {
    data: IngresosData[];
}

export const IngresosChart = ({ data }: IngresosChartProps) => {
    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="mes" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                    <Tooltip
                        cursor={{ fill: '#262626' }}
                        contentStyle={{ backgroundColor: '#16181d', border: '1px solid #262626', borderRadius: '8px' }}
                        itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${value} €`, 'Ingresos']}
                    />
                    <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};