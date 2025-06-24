import { Link, useLocation } from "wouter";
import { Home, List, Plus, History } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/measurements", icon: List, label: "Medições" },
    { path: "/add-measurement", icon: Plus, label: "Adicionar" },
    { path: "/history", icon: History, label: "Histórico" },
  ];

  console.log("BottomNav renderizado em:", location);

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect p-4 z-50 border-t border-white/10">
      <div className="max-w-md mx-auto flex justify-between gap-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          
          return (
            <Link key={path} href={path} className="flex-1">
              <div
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "text-primary bg-primary/15 shadow-sm" 
                    : "text-gray-500 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
