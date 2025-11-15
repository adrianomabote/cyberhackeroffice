import { Route, Switch } from 'wouter';

import Splash from './pages/splash';
import Landing from './pages/landing';
import Login from './pages/login';
import Signup from './pages/signup';
import Home from './pages/home';
import Admin from './pages/admin';
import AdminLogin from './pages/admin-login';
import AdminUsuarios from './pages/admin-usuarios';
import Subscription from './pages/subscription';
import BotGratuito from './pages/bot-gratuito';
import Welcome from './pages/welcome';
import NotFound from './pages/not-found';

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/splash" component={Splash} />

      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/home" component={Home} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/bot-gratuito" component={BotGratuito} />

      <Route path="/admin" component={Admin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/usuarios" component={AdminUsuarios} />

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}