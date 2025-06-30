import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GlassCard from "@/components/ui/glass-card";
import type { MeasurementType, FoodContext, Measurement } from "@shared/schema";

const measurementSchema = z.object({
  value: z.string().min(1, "Valor é obrigatório").transform(val => parseFloat(val)),
  measurementTypeId: z.string().min(1, "Tipo de medição é obrigatório").transform(val => parseInt(val)),
  foodContextId: z.string().min(1, "Contexto alimentar é obrigatório").transform(val => parseInt(val)),
  measuredAt: z.string().min(1, "Data e hora são obrigatórias"),
  notes: z.string().optional(),
});

type MeasurementForm = z.infer<typeof measurementSchema>;

export default function EditMeasurement(props: any) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get measurement ID from URL params - try props first, then location
  const measurementId = props?.params?.id ? parseInt(props.params.id) : parseInt(location.split('/').pop() || '0');

  const { data: measurement, isLoading: measurementLoading } = useQuery({
    queryKey: [`/api/measurements/${measurementId}`],
    enabled: !!measurementId,
  });

  const { data: measurementTypes = [] } = useQuery<MeasurementType[]>({
    queryKey: ["/api/measurement-types"],
  });

  const { data: foodContexts = [] } = useQuery<FoodContext[]>({
    queryKey: ["/api/food-contexts"],
  });

  const form = useForm<MeasurementForm>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      value: "",
      measurementTypeId: "",
      foodContextId: "",
      measuredAt: "",
      notes: "",
    },
  });

  // Update form when measurement data loads
  useEffect(() => {
    if (measurement) {
      const measuredAt = new Date(measurement.measuredAt);
      const formattedDateTime = new Date(measuredAt.getTime() - measuredAt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      form.reset({
        value: measurement.value.toString(),
        measurementTypeId: measurement.measurementTypeId.toString(),
        foodContextId: measurement.foodContextId?.toString() || "",
        measuredAt: formattedDateTime,
        notes: measurement.notes || "",
      });
    }
  }, [measurement, form]);

  const updateMeasurement = useMutation({
    mutationFn: async (data: MeasurementForm) => {
      const measurementData = {
        value: data.value,
        measurementTypeId: data.measurementTypeId,
        foodContextId: data.foodContextId,
        measuredAt: data.measuredAt, // Send as string, server will convert
        notes: data.notes || null,
      };
      const response = await apiRequest(`/api/measurements/${measurementId}`, {
        method: "PATCH",
        body: JSON.stringify(measurementData),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Medição atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/measurements"] });
      navigate("/measurements");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar medição",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MeasurementForm) => {
    updateMeasurement.mutate(data);
  };

  if (measurementLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  if (!measurement) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div>Medição não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/measurements")}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Editar Medição</h1>
        </div>

        <GlassCard className="p-6 shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="measurementTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Medição</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {measurementTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name} ({type.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Digite o valor"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foodContextId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contexto Alimentar</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o contexto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {foodContexts.map((context) => (
                          <SelectItem key={context.id} value={context.id.toString()}>
                            {context.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="measuredAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações sobre esta medição..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/measurements")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMeasurement.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {updateMeasurement.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </GlassCard>
      </div>
    </div>
  );
}