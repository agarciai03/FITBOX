import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface DisciplinaData {
    name: string;
    value: number;
    color: string;
}

interface DisciplinasChartProps {
    data: DisciplinaData[];
}

export const DisciplinasChart = ({ data }: DisciplinasChartProps) => {
    if (data.length === 0) {
        return (
            <div className="h-80 w-full flex flex-col items-center justify-center">
                <p className="text-gray-500 italic text-sm">Sin datos de reservas</p>
            </div>
        );
    }

    return (
        <div className="h-80 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#16181d', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        formatter={(value: any) => [`${value} Asistencias`, 'Total']}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};