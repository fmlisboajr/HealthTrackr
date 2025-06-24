import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/ui/glass-card";
import MeasurementChart from "@/components/ui/measurement-chart";
import { ArrowLeft, TrendingUp, Activity } from "lucide-react";
import type { MeasurementType, Measurement, FoodContext } from "@shared/schema";

export default function Statistics() {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  // Fetch measurement types
  const { data: measurementTypes = [] } = useQuery<MeasurementType[]>({
    queryKey: ["/api/measurement-types"],
  });

  // Auto-select first type if available
  const effectiveTypeId = selectedTypeId || measurementTypes[0]?.id;

  // Fetch all measurements and filter on frontend
  const { data: allMeasurements = [] } = useQuery<Measurement[]>({
    queryKey: ["/api/measurements"],
    enabled: !!effectiveTypeId,
  });

  // Filter measurements by date range and measurement type
  const measurements = allMeasurements.filter(measurement => {
    const measurementDate = new Date(measurement.measuredAt);
    const cutoffDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000);
    return measurementDate >= cutoffDate && measurement.measurementTypeId === effectiveTypeId;
  });

  // Calculate statistics from filtered measurements
  const stats = useMemo(() => {
    if (measurements.length === 0) {
      return { average: 0, count: 0, min: 0, max: 0 };
    }

    const values = measurements.map(m => parseFloat(m.value.toString()));
    return {
      average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [measurements]);

  // Fetch food contexts
  const { data: foodContexts = [] } = useQuery<FoodContext[]>({
    queryKey: ["/api/food-contexts"],
  });

  const selectedType = measurementTypes.find(t => t.id === effectiveTypeId);
  const filteredMeasurements = measurements.filter(m => m.measurementTypeId === effectiveTypeId);

  // Calculate context distribution
  const contextStats = foodContexts.map(context => {
    const count = filteredMeasurements.filter(m => m.foodContextId === context.id).length;
    const percentage = filteredMeasurements.length > 0 ? (count / filteredMeasurements.length) * 100 : 0;
    return {
      name: context.name,
      count,
      percentage,
    };
  }).filter(stat => stat.count > 0);

  return (
    <div className="min-h-screen">
      <header className="glass-effect p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 glass-dark rounded-xl p-0">
              <ArrowLeft className="text-gray-600 dark:text-gray-300" size={16} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Estatísticas</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Period Selector */}
          <GlassCard className="p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Período
            </label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="glass-dark border-0 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </GlassCard>

          {/* Type Selector */}
          <GlassCard className="p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <Select 
              value={effectiveTypeId?.toString() || ""} 
              onValueChange={(value) => setSelectedTypeId(parseInt(value))}
            >
              <SelectTrigger className="glass-dark border-0 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {measurementTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </GlassCard>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <GlassCard className="p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Média</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.average.toFixed(1) || "0"}
            </p>
            <p className="text-xs text-gray-500">{selectedType?.unit}</p>
          </GlassCard>
          <GlassCard className="p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Medições</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.count || 0}
            </p>
            <p className="text-xs text-gray-500">registros</p>
          </GlassCard>
        </div>

        {/* Chart */}
        <GlassCard className="p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            Tendência - {selectedType?.name}
          </h3>
          <MeasurementChart 
            measurements={filteredMeasurements}
            measurementType={selectedType}
          />
        </GlassCard>

        {/* Context Distribution */}
        {contextStats.length > 0 && (
          <GlassCard className="p-6 shadow-lg mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              Distribuição por Contexto
            </h3>
            <div className="space-y-3">
              {contextStats.map((context, index) => (
                <div key={context.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-primary' :
                      index === 1 ? 'bg-secondary' :
                      index === 2 ? 'bg-accent' :
                      index === 3 ? 'bg-orange-500' :
                      'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-700 dark:text-gray-300">{context.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {context.count}
                    </span>
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-secondary' :
                          index === 2 ? 'bg-accent' :
                          index === 3 ? 'bg-orange-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${context.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Insights */}
        {stats && stats.count > 0 && (
          <GlassCard className="p-6 shadow-lg">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={12} />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Você registrou {stats.count} medições nos últimos {selectedPeriod} dias.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="text-blue-600 dark:text-blue-400" size={12} />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Sua média de {selectedType?.name.toLowerCase()} foi {stats.average.toFixed(1)} {selectedType?.unit}.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {filteredMeasurements.length === 0 && (
          <GlassCard className="p-6 shadow-lg">
            <div className="text-center py-8">
              <Activity className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Nenhuma medição encontrada para este período
              </p>
              <Link href="/add-measurement">
                <Button>Adicionar Medição</Button>
              </Link>
            </div>
          </GlassCard>
        )}
      </main>
    </div>
  );
}
