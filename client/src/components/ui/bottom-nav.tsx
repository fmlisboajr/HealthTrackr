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
    <>
      {/* Menu de navegação inferior - Forçado para aparecer */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
        style={{
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          zIndex: 99999,
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          minHeight: '70px'
        }}
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location === path;
              
              return (
                <Link key={path} href={path}>
                  <a
                    className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all duration-200 min-w-[60px] ${
                      isActive 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:text-blue-600"
                    }`}
                  >
                    <Icon size={22} className="mb-1" />
                    <span className="text-xs font-medium">{label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
