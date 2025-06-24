import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import GlassCard from "@/components/ui/glass-card";
import { ArrowLeft, Share, UserCheck, Trash2, Eye, Download, Bell } from "lucide-react";
import type { DoctorAccess, User } from "@shared/schema";

const doctorAccessSchema = z.object({
  doctorEmail: z.string().email("Digite um email válido"),
});

type DoctorAccessForm = z.infer<typeof doctorAccessSchema>;

export default function DoctorAccess() {
  const { toast } = useToast();
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);

  // Fetch doctor access data
  const { data: doctorAccessData = [] } = useQuery<DoctorAccess[] | User[]>({
    queryKey: ["/api/doctor-access"],
  });

  const form = useForm<DoctorAccessForm>({
    resolver: zodResolver(doctorAccessSchema),
    defaultValues: {
      doctorEmail: "",
    },
  });

  const addDoctorMutation = useMutation({
    mutationFn: async (data: DoctorAccessForm) => {
      await apiRequest("/api/doctor-access", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctor-access"] });
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso!",
      });
      form.reset();
      setIsAddingDoctor(false);
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
        description: "Erro ao enviar convite. Verifique o email do médico.",
        variant: "destructive",
      });
    },
  });

  const removeDoctorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/doctor-access/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctor-access"] });
      toast({
        title: "Sucesso",
        description: "Acesso médico removido com sucesso!",
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
        description: "Erro ao remover acesso médico.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DoctorAccessForm) => {
    addDoctorMutation.mutate(data);
  };

  const isDoctorAccess = Array.isArray(doctorAccessData) && doctorAccessData.length > 0 && 'patientId' in doctorAccessData[0];

  return (
    <div className="min-h-screen">
      <header className="glass-effect p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 glass-dark rounded-xl p-0">
              <ArrowLeft className="text-gray-600 dark:text-gray-300" size={16} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Acesso Médico</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Add Doctor */}
        <GlassCard className="p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            Compartilhar com Médico
          </h3>
          
          {!isAddingDoctor ? (
            <Button
              onClick={() => setIsAddingDoctor(true)}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200"
            >
              <Share className="mr-2" size={16} />
              Adicionar Médico
            </Button>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="doctorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email do Médico
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="medico@clinica.com"
                          className="glass-dark border-0 focus:ring-2 focus:ring-primary rounded-2xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={addDoctorMutation.isPending}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200"
                  >
                    <Share className="mr-2" size={16} />
                    {addDoctorMutation.isPending ? "Enviando..." : "Enviar Convite"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingDoctor(false);
                      form.reset();
                    }}
                    className="px-4 rounded-2xl"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </GlassCard>

        {/* Active Doctors */}
        <GlassCard className="p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            Médicos com Acesso
          </h3>
          
          {doctorAccessData.length > 0 ? (
            <div className="space-y-3">
              {doctorAccessData.map((item, index) => {
                // Handle both DoctorAccess and User types
                const isAccess = 'patientId' in item;
                const displayName = isAccess ? `Dr. ${(item as any).doctor?.firstName || 'Médico'}` : `Dr. ${(item as User).firstName || 'Médico'}`;
                const displayEmail = isAccess ? (item as any).doctor?.email : (item as User).email;
                const itemId = isAccess ? (item as DoctorAccess).id : index;
                
                return (
                  <div key={itemId} className="flex items-center justify-between py-3 border-b border-white border-opacity-20 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <UserCheck className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {displayName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {displayEmail}
                        </p>
                      </div>
                    </div>
                    {isAccess && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDoctorMutation.mutate((item as DoctorAccess).id)}
                        disabled={removeDoctorMutation.isPending}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 dark:text-gray-300">
                Nenhum médico com acesso
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Adicione um médico para compartilhar seus dados
              </p>
            </div>
          )}
        </GlassCard>

        {/* Permissions */}
        <GlassCard className="p-6 shadow-lg">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Permissões</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="text-blue-500" size={16} />
                <span className="text-gray-700 dark:text-gray-300">Visualizar medições</span>
              </div>
              <div className="w-12 h-6 bg-secondary rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="text-green-500" size={16} />
                <span className="text-gray-700 dark:text-gray-300">Exportar dados</span>
              </div>
              <div className="w-12 h-6 bg-secondary rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="text-orange-500" size={16} />
                <span className="text-gray-700 dark:text-gray-300">Receber notificações</span>
              </div>
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform shadow-sm"></div>
              </div>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
