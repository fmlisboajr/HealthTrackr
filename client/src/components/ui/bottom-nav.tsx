import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, List, Plus, BarChart3 } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/measurements", icon: List, label: "Medições" },
    { path: "/add-measurement", icon: Plus, label: "Adicionar" },
    { path: "/statistics", icon: BarChart3, label: "Gráficos" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect p-4 z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          
          return (
            <Link key={path} href={path}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-colors ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-gray-500 hover:text-primary"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
