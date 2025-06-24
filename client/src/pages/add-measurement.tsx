import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import GlassCard from "@/components/ui/glass-card";
import { ArrowLeft, Save, Moon, Utensils, CheckCircle, Pill, MoreHorizontal } from "lucide-react";
import type { MeasurementType, FoodContext } from "@shared/schema";

const measurementSchema = z.object({
  measurementTypeId: z.number().min(1, "Selecione um tipo de medição"),
  value: z.string().min(1, "Digite um valor"),
  measuredAt: z.string().min(1, "Data e hora são obrigatórias"),
  foodContextId: z.number().optional(),
  notes: z.string().optional(),
});

type MeasurementForm = z.infer<typeof measurementSchema>;

const contextIcons = {
  "Jejum": Moon,
  "Pré-refeição": Utensils,
  "Pós-refeição": CheckCircle,
  "Após medicação": Pill,
  "Outros": MoreHorizontal,
};

export default function AddMeasurement() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedContext, setSelectedContext] = useState<number | null>(null);

  // Fetch measurement types
  const { data: measurementTypes = [] } = useQuery<MeasurementType[]>({
    queryKey: ["/api/measurement-types"],
  });

  // Fetch food contexts
  const { data: foodContexts = [] } = useQuery<FoodContext[]>({
    queryKey: ["/api/food-contexts"],
  });

  const form = useForm<MeasurementForm>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      measuredAt: new Date().toISOString().slice(0, 16),
    },
  });

  const createMeasurement = useMutation({
    mutationFn: async (data: MeasurementForm) => {
      await apiRequest("/api/measurements", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          value: data.value,
          measuredAt: new Date(data.measuredAt).toISOString(),
          foodContextId: selectedContext || undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/measurements"] });
      toast({
        title: "Sucesso",
        description: "Medição salva com sucesso!",
      });
      setLocation("/");
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
        description: "Erro ao salvar medição. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MeasurementForm) => {
    createMeasurement.mutate(data);
  };

  const selectedType = measurementTypes.find(t => t.id === form.watch("measurementTypeId"));

  return (
    <div className="min-h-screen">
      <header className="glass-effect p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 glass-dark rounded-xl p-0">
              <ArrowLeft className="text-gray-600 dark:text-gray-300" size={16} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Nova Medição</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Measurement Type */}
            <GlassCard className="p-6 shadow-lg">
              <FormField
                control={form.control}
                name="measurementTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Medição
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="glass-dark border-0 focus:ring-2 focus:ring-primary rounded-2xl">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {measurementTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GlassCard>

            {/* Value Input */}
            <GlassCard className="p-6 shadow-lg">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Valor
                    </FormLabel>
                    <div className="flex items-center space-x-3">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="128"
                          className="glass-dark border-0 focus:ring-2 focus:ring-primary rounded-2xl text-center text-2xl font-bold"
                          {...field}
                        />
                      </FormControl>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {selectedType?.unit || ""}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GlassCard>

            {/* Date and Time */}
            <GlassCard className="p-6 shadow-lg">
              <FormField
                control={form.control}
                name="measuredAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Data e Hora
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="glass-dark border-0 focus:ring-2 focus:ring-primary rounded-2xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GlassCard>

            {/* Food Context */}
            <GlassCard className="p-6 shadow-lg">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Contexto Alimentar
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {foodContexts.slice(0, 4).map((context) => {
                  const Icon = contextIcons[context.name as keyof typeof contextIcons] || MoreHorizontal;
                  const isSelected = selectedContext === context.id;
                  
                  return (
                    <button
                      key={context.id}
                      type="button"
                      onClick={() => setSelectedContext(context.id)}
                      className={`p-3 glass-dark rounded-xl border-2 transition-all text-center ${
                        isSelected 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : 'border-transparent hover:border-primary hover:bg-primary hover:bg-opacity-10'
                      }`}
                    >
                      <Icon className={`mx-auto mb-1 ${
                        context.name === 'Jejum' ? 'text-primary' :
                        context.name === 'Pré-refeição' ? 'text-secondary' :
                        context.name === 'Pós-refeição' ? 'text-accent' :
                        context.name === 'Após medicação' ? 'text-orange-500' :
                        'text-gray-500'
                      }`} size={16} />
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {context.name}
                      </p>
                    </button>
                  );
                })}
              </div>
              {foodContexts.length > 4 && (
                <button
                  type="button"
                  onClick={() => setSelectedContext(foodContexts[4]?.id || null)}
                  className={`w-full mt-3 p-3 glass-dark rounded-xl border-2 transition-all text-center ${
                    selectedContext === foodContexts[4]?.id
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-transparent hover:border-primary hover:bg-primary hover:bg-opacity-10'
                  }`}
                >
                  <MoreHorizontal className="mx-auto mb-1 text-gray-500" size={16} />
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {foodContexts[4]?.name || "Outros"}
                  </p>
                </button>
              )}
            </GlassCard>

            {/* Notes */}
            <GlassCard className="p-6 shadow-lg">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Observações (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações sobre esta medição..."
                        className="glass-dark border-0 focus:ring-2 focus:ring-primary rounded-2xl resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GlassCard>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createMeasurement.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-2xl transition-colors duration-200 shadow-lg"
              size="lg"
            >
              <Save className="mr-2" size={16} />
              {createMeasurement.isPending ? "Salvando..." : "Salvar Medição"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
