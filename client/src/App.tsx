import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useProtection } from "@/hooks/use-protection";
import Splash from "@/pages/splash";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Subscription from "@/pages/subscription";
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Subscription} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/app" component={Home} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/cyber" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Verificar se já viu o splash antes (na sessão atual)
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      // Mostrar splash por 3 segundos
      const timer = setTimeout(() => {
        sessionStorage.setItem('hasSeenSplash', 'true');
        setShowSplash(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (showSplash) {
    return <Splash />;
  }

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