import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import Splash from "@/pages/splash";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Subscription from "@/pages/subscription";
import BotGratuito from "@/pages/bot-gratuito";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import AdminUsuarios from "@/pages/admin-usuarios";
import AdminResultadosClientes from "@/pages/admin-resultados-clientes";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* público / marketing */}
      <Route path="/" component={Landing} />
      <Route path="/splash" component={Splash} />

      {/* fluxo usuário */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/home" component={Home} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/bot-gratuito" component={BotGratuito} />

      {/* admin */}
      <Route path="/admin" component={Admin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/usuarios" component={AdminUsuarios} />
      <Route path="/admin/resultados-clientes" component={AdminResultadosClientes} />

            {/* 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
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