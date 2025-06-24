import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, Activity, Calendar, Zap } from "lucide-react";
import type { Measurement, MeasurementType, FoodContext } from "@shared/schema";
import MeasurementChart from "@/components/ui/measurement-chart";
import GlassCard from "@/components/ui/glass-card";

export default function History() {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  // Fetch data
  const { data: measurementTypes = [] } = useQuery<MeasurementType[]>({
    queryKey: ["/api/measurement-types"],
  });

  const { data: allMeasurements = [] } = useQuery<Measurement[]>({
    queryKey: ["/api/measurements"],
  });

  const { data: foodContexts = [] } = useQuery<FoodContext[]>({
    queryKey: ["/api/food-contexts"],
  });

  const effectiveTypeId = selectedTypeId || measurementTypes[0]?.id;
  const selectedType = measurementTypes.find(t => t.id === effectiveTypeId);

  // Filter measurements by date range and type
  const measurements = useMemo(() => {
    const cutoffDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000);
    return allMeasurements.filter(measurement => {
      const measurementDate = new Date(measurement.measuredAt);
      return measurementDate >= cutoffDate && measurement.measurementTypeId === effectiveTypeId;
    });
  }, [allMeasurements, selectedPeriod, effectiveTypeId]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (measurements.length === 0) {
      return { average: 0, count: 0, min: 0, max: 0, activeDays: 0 };
    }

    const values = measurements.map(m => parseFloat(m.value.toString()));
    const uniqueDays = new Set(
      measurements.map(m => new Date(m.measuredAt).toDateString())
    ).size;

    return {
      average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      activeDays: uniqueDays,
    };
  }, [measurements]);

  // Calculate context statistics
  const contextStats = useMemo(() => {
    return foodContexts.map(context => {
      const contextMeasurements = measurements.filter(m => m.foodContextId === context.id);
      const values = contextMeasurements.map(m => parseFloat(m.value.toString()));
      const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      
      return {
        name: context.name,
        average: Math.round(average * 100) / 100,
        count: contextMeasurements.length,
        color: getContextColor(context.id),
      };
    }).filter(stat => stat.count > 0);
  }, [measurements, foodContexts]);

  // Get chart data for trend
  const chartData = useMemo(() => {
    return measurements
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
      .map(measurement => ({
        date: new Date(measurement.measuredAt).toLocaleDateString('pt-BR', {
          month: '2-digit',
          day: '2-digit',
        }),
        value: parseFloat(measurement.value.toString()),
        fullDate: new Date(measurement.measuredAt).toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));
  }, [measurements]);

  function getContextColor(contextId: number) {
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
    return colors[contextId % colors.length];
  }

  return (
    <div className="min-h-screen p-4 pb-20 space-y-6">
      {/* Header Controls */}
      <div className="flex gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="glass-dark border-0 rounded-xl w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={selectedTypeId?.toString() || ""} 
          onValueChange={(value) => setSelectedTypeId(parseInt(value))}
        >
          <SelectTrigger className="glass-dark border-0 rounded-xl w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {measurementTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div className="text-2xl font-bold text-blue-600">{stats.average}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Média<br />{selectedType?.unit}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <Activity className="w-8 h-8 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{stats.count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Medições<br />total
            </div>
          </div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="text-2xl font-bold text-purple-600">{stats.activeDays}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Dias<br />ativos
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Trend Chart */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tendência de {selectedType?.name || "Medições"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MeasurementChart 
            measurements={measurements} 
            measurementType={selectedType}
          />
        </CardContent>
      </GlassCard>

      {/* Context Chart */}
      {contextStats.length > 0 && (
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Médias por Contexto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contextStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: "rgba(107, 114, 128, 0.8)" }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "rgba(107, 114, 128, 0.8)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-effect p-3 rounded-xl shadow-lg border-0">
                            <p className="font-medium text-gray-800 dark:text-white">
                              {data.name}
                            </p>
                            <p className="text-primary font-bold">
                              Média: {data.average} {selectedType?.unit}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {data.count} medições
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="average" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlassCard>
      )}

      {/* Detailed Summary */}
      <GlassCard>
        <CardHeader>
          <CardTitle>Resumo Detalhado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contextStats.map((context) => (
            <div key={context.name} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{context.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{context.count} medições</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{context.average} {selectedType?.unit}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">média</div>
              </div>
            </div>
          ))}
        </CardContent>
      </GlassCard>
    </div>
  );
}