import { Link, useLocation } from "wouter";
import { TrendingUp, Calendar, BarChart3, Users } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: TrendingUp, label: "Início" },
    { path: "/history", icon: Calendar, label: "Histórico" },
    { path: "/statistics", icon: BarChart3, label: "Estatísticas" },
    { path: "/doctor-access", icon: Users, label: "Compartilhar" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-[9999]">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            
            return (
              <Link key={path} href={path} className="flex-1">
                <div
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  <Icon size={24} className="mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
