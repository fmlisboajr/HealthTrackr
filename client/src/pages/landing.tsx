import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp, Shield, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 glass-effect rounded-2xl flex items-center justify-center">
            <Heart className="text-4xl text-primary" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            HealthTracker
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitore sua saúde com precisão
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Acompanhamento Inteligente
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Registre e monitore suas medições de saúde
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-green-600 rounded-xl flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Compartilhamento Médico
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Compartilhe dados com seus médicos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Dados Seguros
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Seus dados protegidos e privados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Button */}
        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-6">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200"
              size="lg"
            >
              Entrar com Replit
            </Button>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Faça login para começar a monitorar sua saúde
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
