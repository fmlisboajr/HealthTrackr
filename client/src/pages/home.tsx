import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";

import GlassCard from "@/components/ui/glass-card";
import { Heart, Plus, BarChart3, UserCheck, Settings, Droplets } from "lucide-react";
import type { Measurement, MeasurementType, FoodContext } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Initialize default data
  const initMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/init");
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
    },
  });

  // Fetch recent measurements
  const { data: measurements = [] } = useQuery<Measurement[]>({
    queryKey: ["/api/measurements", { limit: 5 }],
    enabled: !!user,
  });

  // Fetch measurement types
  const { data: measurementTypes = [] } = useQuery<MeasurementType[]>({
    queryKey: ["/api/measurement-types"],
    enabled: !!user,
  });

  // Fetch food contexts
  const { data: foodContexts = [] } = useQuery<FoodContext[]>({
    queryKey: ["/api/food-contexts"],
    enabled: !!user,
  });

  // Initialize default data on first load
  useEffect(() => {
    if (user && measurementTypes.length === 0) {
      initMutation.mutate();
    }
  }, [user, measurementTypes.length]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 glass-effect rounded-2xl flex items-center justify-center animate-pulse">
            <Heart className="text-primary" size={32} />
          </div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  const glucoseType = measurementTypes.find(t => t.name === "Glicose");
  const recentGlucose = measurements.find(m => m.measurementTypeId === glucoseType?.id);
  const fastingContext = foodContexts.find(c => c.name === "Jejum");

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass-effect p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 glass-dark rounded-xl flex items-center justify-center">
              <Heart className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">HealthTracker</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {user?.firstName || user?.email || "Usuário"}
              </p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="w-10 h-10 glass-dark rounded-xl p-0">
              <Settings className="text-gray-600 dark:text-gray-300" size={16} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Quick Stats */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Resumo de Hoje
          </h2>
          {recentGlucose && glucoseType ? (
            <GlassCard className="p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                    <Droplets className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {glucoseType.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Última: {new Date(recentGlucose.measuredAt).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {recentGlucose.value}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {glucoseType.unit}
                  </p>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-4 shadow-lg">
              <div className="text-center py-8">
                <Droplets className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600 dark:text-gray-300">
                  Nenhuma medição hoje
                </p>
                <Link href="/add-measurement">
                  <Button className="mt-3" size="sm">
                    Adicionar Primeira Medição
                  </Button>
                </Link>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Recent Measurements */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Medições Recentes
            </h2>
            <Link href="/measurements">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todas
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {measurements.length > 0 ? (
              measurements.slice(0, 3).map((measurement) => {
                const type = measurementTypes.find(t => t.id === measurement.measurementTypeId);
                const context = foodContexts.find(c => c.id === measurement.foodContextId);
                
                return (
                  <GlassCard key={measurement.id} className="p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-secondary"></div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {type?.name || "Medição"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {context?.name || "Sem contexto"}
                          </p>
                        </div>
                      </div>
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
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="p-4 shadow-lg">
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Nenhuma medição registrada
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/add-measurement">
              <GlassCard className="p-4 shadow-lg hover:bg-white hover:bg-opacity-40 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Plus className="text-white" size={20} />
                  </div>
                  <p className="font-medium text-gray-800 dark:text-white">Nova Medição</p>
                </div>
              </GlassCard>
            </Link>
            <Link href="/statistics">
              <GlassCard className="p-4 shadow-lg hover:bg-white hover:bg-opacity-40 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="text-white" size={20} />
                  </div>
                  <p className="font-medium text-gray-800 dark:text-white">Estatísticas</p>
                </div>
              </GlassCard>
            </Link>
          </div>
        </div>

        {/* Doctor Access */}
        <Link href="/doctor-access">
          <GlassCard className="p-4 shadow-lg hover:bg-white hover:bg-opacity-40 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Acesso Médico</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Compartilhar dados</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                Gerenciar
              </Button>
            </div>
          </GlassCard>
        </Link>
      </main>
    </div>
  );
}
