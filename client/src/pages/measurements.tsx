import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import GlassCard from "@/components/ui/glass-card";
import BottomNav from "@/components/ui/bottom-nav";
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Filter } from "lucide-react";
import type { Measurement, MeasurementType, FoodContext } from "@shared/schema";

export default function Measurements() {
  const { toast } = useToast();
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState("7");

  // Fetch measurements
  const { data: measurements = [] } = useQuery<Measurement[]>({
    queryKey: ["/api/measurements", { limit: 100 }],
  });

  // Fetch measurement types
  const { data: measurementTypes = [] } = useQuery<MeasurementType[]>({
    queryKey: ["/api/measurement-types"],
  });

  // Fetch food contexts
  const { data: foodContexts = [] } = useQuery<FoodContext[]>({
    queryKey: ["/api/food-contexts"],
  });

  const deleteMeasurement = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/measurements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/measurements"] });
      toast({
        title: "Sucesso",
        description: "Medição excluída com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao excluir medição.",
        variant: "destructive",
      });
    },
  });

  // Filter measurements
  const filteredMeasurements = measurements.filter(measurement => {
    const typeMatch = !selectedTypeId || measurement.measurementTypeId === parseInt(selectedTypeId);
    
    const dateRange = parseInt(selectedDateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateRange);
    const dateMatch = new Date(measurement.measuredAt) >= cutoffDate;
    
    return typeMatch && dateMatch;
  });

  // Group measurements by date
  const groupedMeasurements = filteredMeasurements.reduce((groups, measurement) => {
    const date = new Date(measurement.measuredAt).toLocaleDateString('pt-BR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(measurement);
    return groups;
  }, {} as Record<string, Measurement[]>);

  return (
    <div className="min-h-screen pb-20">
      <header className="glass-effect p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 glass-dark rounded-xl p-0">
              <ArrowLeft className="text-gray-600 dark:text-gray-300" size={16} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Medições</h1>
          <div className="flex-1" />
          <Link href="/add-measurement">
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white rounded-xl">
              <Plus size={16} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <GlassCard className="p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="inline mr-1" size={14} />
              Tipo
            </label>
            <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
              <SelectTrigger className="glass-dark border-0 rounded-xl">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {measurementTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </GlassCard>

          <GlassCard className="p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline mr-1" size={14} />
              Período
            </label>
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="glass-dark border-0 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="3650">Todos</SelectItem>
              </SelectContent>
            </Select>
          </GlassCard>
        </div>

        {/* Measurements List */}
        {Object.keys(groupedMeasurements).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedMeasurements)
              .sort(([dateA], [dateB]) => new Date(dateB.split('/').reverse().join('-')).getTime() - new Date(dateA.split('/').reverse().join('-')).getTime())
              .map(([date, dateMeasurements]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 px-2">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {dateMeasurements
                      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
                      .map((measurement) => {
                        const type = measurementTypes.find(t => t.id === measurement.measurementTypeId);
                        const context = foodContexts.find(c => c.id === measurement.foodContextId);
                        
                        return (
                          <GlassCard key={measurement.id} className="p-4 shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-white">
                                    {type?.name || "Medição"}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {context?.name || "Sem contexto"}
                                  </p>
                                  {measurement.notes && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {measurement.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <p className="font-bold text-gray-800 dark:text-white">
                                    {measurement.value} {type?.unit}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(measurement.measuredAt).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0 text-gray-500 hover:text-primary"
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteMeasurement.mutate(measurement.id)}
                                    disabled={deleteMeasurement.isPending}
                                    className="w-8 h-8 p-0 text-gray-500 hover:text-red-500"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </GlassCard>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <GlassCard className="p-6 shadow-lg">
            <div className="text-center py-8">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {selectedTypeId || selectedDateRange !== "3650" 
                  ? "Nenhuma medição encontrada para os filtros selecionados"
                  : "Nenhuma medição registrada"
                }
              </p>
              <Link href="/add-measurement">
                <Button className="bg-secondary hover:bg-secondary/90 text-white">
                  <Plus className="mr-2" size={16} />
                  Adicionar Medição
                </Button>
              </Link>
            </div>
          </GlassCard>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
