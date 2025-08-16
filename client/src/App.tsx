import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { AdminLogin } from "./pages/admin-login";
import EmailVerification from "./pages/EmailVerification";
import NotFound from "./pages/not-found";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/" component={AuthPage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/admin" component={AdminLogin} />
          <Route path="/verify-email" component={() => <EmailVerification />} />
          <Route path="/email-verification" component={() => <EmailVerification />} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;