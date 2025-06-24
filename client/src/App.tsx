import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/ui/bottom-nav";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AddMeasurement from "@/pages/add-measurement";
import Statistics from "@/pages/statistics";
import History from "@/pages/history";
import DoctorAccess from "@/pages/doctor-access";
import Settings from "@/pages/settings";
import Measurements from "@/pages/measurements";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("Auth state:", { isAuthenticated, isLoading });

  return (
    <>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/measurements" component={Measurements} />
            <Route path="/add-measurement" component={AddMeasurement} />
            <Route path="/statistics" component={Statistics} />
            <Route path="/history" component={History} />
            <Route path="/doctor-access" component={DoctorAccess} />
            <Route path="/settings" component={Settings} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      {!isLoading && isAuthenticated && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
