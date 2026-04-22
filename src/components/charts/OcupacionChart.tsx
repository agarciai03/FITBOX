import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OcupacionData {
    hora: string;
    ocupacion: number;
}

interface OcupacionChartProps {
    data: OcupacionData[];
}

export const OcupacionChart = ({ data }: OcupacionChartProps) => {
    return (
        <div className="w-full mt-4">
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="hora"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#a3a3a3', fontSize: 10 }}
                        dy={10}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#16181d', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#dc2626', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${value}% Ocupación`, '']}
                    />
                    <Area
                        type="monotone"
                        dataKey="ocupacion"
                        stroke="#dc2626"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorOcupacion)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};