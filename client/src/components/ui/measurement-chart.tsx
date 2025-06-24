import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import type { Measurement, MeasurementType } from "@shared/schema";

interface MeasurementChartProps {
  measurements: Measurement[];
  measurementType?: MeasurementType;
}

export default function MeasurementChart({ measurements, measurementType }: MeasurementChartProps) {
  const chartData = useMemo(() => {
    const sortedMeasurements = [...measurements]
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
      .slice(-20); // Show last 20 measurements

    return sortedMeasurements.map((measurement) => ({
      date: new Date(measurement.measuredAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      time: new Date(measurement.measuredAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: parseFloat(measurement.value.toString()),
      fullDate: new Date(measurement.measuredAt).toLocaleString('pt-BR'),
    }));
  }, [measurements]);

  if (chartData.length === 0) {
    return (
      <div className="h-48 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600 dark:text-gray-300">Sem dados para exibir</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adicione medições para ver o gráfico
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: "rgba(107, 114, 128, 0.8)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "rgba(107, 114, 128, 0.8)" }}
            axisLine={false}
            tickLine={false}
            domain={measurementType ? [
              measurementType.minValue ? parseFloat(measurementType.minValue.toString()) : 'dataMin',
              measurementType.maxValue ? parseFloat(measurementType.maxValue.toString()) : 'dataMax'
            ] : ['dataMin', 'dataMax']}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="glass-effect p-3 rounded-xl shadow-lg border-0">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {data.fullDate}
                    </p>
                    <p className="text-primary font-bold">
                      {payload[0].value} {measurementType?.unit}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={4}
            fill="url(#colorGradient)"
            fillOpacity={1}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "white", r: 6 }}
            activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 3, fill: "white", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
            connectNulls={false}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
