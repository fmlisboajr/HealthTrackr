import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import GlassCard from "@/components/ui/glass-card";
import { 
  ArrowLeft, 
  User, 
  Edit, 
  Plus, 
  Droplets, 
  Heart, 
  Weight, 
  Thermometer,
  Bell,
  Download,
  FolderSync,
  HelpCircle,
  Mail,
  LogOut
} from "lucide-react";
import type { MeasurementType, InsertMeasurementType } from "@shared/schema";

const measurementTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  minValue: z.string().optional(),
  maxValue: z.string().optional(),
});

type MeasurementTypeForm = z.infer<typeof measurementTypeSchema>;

const typeIcons = {
  "Glicose": Droplets,
  "Pressão Arterial": Heart,
  "Peso": Weight,
  "Temperatura": Thermometer,
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingType, setIsAddingType] = useState(false);

  // Fetch measurement types
  const { data: measurementTypes = [] } = useQuery<MeasurementType[]>({
    queryKey: ["/api/measurement-types"],
  });

  const form = useForm<MeasurementTypeForm>({
    resolver: zodResolver(measurementTypeSchema),
    defaultValues: {
      name: "",
      unit: "",
      minValue: "",
      maxValue: "",
    },
  });

  const createTypeMutation = useMutation({
    mutationFn: async (data: MeasurementTypeForm) => {
      const typeData: InsertMeasurementType = {
        ...data,
        minValue: data.minValue ? data.minValue : undefined,
        maxValue: data.maxValue ? data.maxValue : undefined,
      };
      await apiRequest("POST", "/api/measurement-types", typeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/measurement-types"] });
      toast({
        title: "Sucesso",
        description: "Tipo de medição adicionado com sucesso!",
      });
      form.reset();
      setIsAddingType(false);
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
        description: "Erro ao adicionar tipo de medição.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MeasurementTypeForm) => {
    createTypeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen">
      <header className="glass-effect p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 glass-dark rounded-xl p-0">
              <ArrowLeft className="text-gray-600 dark:text-gray-300" size={16} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Configurações</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Profile */}
        <GlassCard className="p-6 shadow-lg mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <User className="text-white text-2xl" size={32} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split('@')[0] || "Usuário"
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {user?.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.userType === 'doctor' ? 'Médico' : 'Paciente'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full glass-dark border-0 rounded-xl py-3 px-4 font-medium hover:bg-white hover:bg-opacity-30 transition-colors"
          >
            <Edit className="mr-2" size={16} />
            Editar Perfil
          </Button>
        </GlassCard>

        {/* Measurement Types */}
        <GlassCard className="p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            Tipos de Medição
          </h3>
          
          <div className="space-y-3 mb-4">
            {measurementTypes.map((type) => {
              const Icon = typeIcons[type.name as keyof typeof typeIcons] || Droplets;
              
              return (
                <div key={type.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="text-primary" size={16} />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {type.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({type.unit})
                      </span>
                    </div>
                  </div>
                  <Switch checked={type.isActive} />
                </div>
              );
            })}
          </div>

          {!isAddingType ? (
            <Button
              onClick={() => setIsAddingType(true)}
              variant="outline"
              className="w-full glass-dark border-0 rounded-xl py-3 px-4 font-medium hover:bg-white hover:bg-opacity-30 transition-colors"
            >
              <Plus className="mr-2" size={16} />
              Adicionar Tipo
            </Button>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Colesterol"
                          className="glass-dark border-0 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: mg/dL"
                          className="glass-dark border-0 rounded-xl"
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
                    disabled={createTypeMutation.isPending}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white rounded-xl"
                  >
                    {createTypeMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingType(false);
                      form.reset();
                    }}
                    className="px-4 rounded-xl"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </GlassCard>

        {/* Notifications */}
        <GlassCard className="p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Notificações</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="text-blue-500" size={16} />
                <span className="text-gray-700 dark:text-gray-300">Lembretes de medição</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="text-green-500" size={16} />
                <span className="text-gray-700 dark:text-gray-300">Relatórios semanais</span>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </GlassCard>

        {/* Data Management */}
        <GlassCard className="p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Dados</h3>
          <div className="space-y-3">
            <button className="w-full glass-dark rounded-xl py-3 px-4 font-medium hover:bg-white hover:bg-opacity-30 transition-colors text-left flex items-center">
              <Download className="mr-3 text-primary" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Exportar Dados</span>
            </button>
            <button className="w-full glass-dark rounded-xl py-3 px-4 font-medium hover:bg-white hover:bg-opacity-30 transition-colors text-left flex items-center">
              <FolderSync className="mr-3 text-secondary" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Sincronizar</span>
            </button>
          </div>
        </GlassCard>

        {/* Support */}
        <GlassCard className="p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Suporte</h3>
          <div className="space-y-3">
            <button className="w-full glass-dark rounded-xl py-3 px-4 font-medium hover:bg-white hover:bg-opacity-30 transition-colors text-left flex items-center">
              <HelpCircle className="mr-3 text-blue-500" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Central de Ajuda</span>
            </button>
            <button className="w-full glass-dark rounded-xl py-3 px-4 font-medium hover:bg-white hover:bg-opacity-30 transition-colors text-left flex items-center">
              <Mail className="mr-3 text-green-500" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Contato</span>
            </button>
          </div>
        </GlassCard>

        {/* Logout */}
        <Button
          onClick={() => window.location.href = '/api/logout'}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200"
        >
          <LogOut className="mr-2" size={16} />
          Sair da Conta
        </Button>
      </main>
    </div>
  );
}
