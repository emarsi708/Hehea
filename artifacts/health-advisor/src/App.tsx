import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import InputForm from "@/pages/input";
import Results from "@/pages/results";
import History from "@/pages/history";
import Symptoms from "@/pages/symptoms";
import Calculators from "@/pages/calculators";
import Library from "@/pages/library";
import Plan from "@/pages/plan";
import { TermsModal } from "@/components/TermsModal";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/input" component={InputForm} />
      <Route path="/results" component={Results} />
      <Route path="/plan" component={Plan} />
      <Route path="/history" component={History} />
      <Route path="/symptoms" component={Symptoms} />
      <Route path="/calculators" component={Calculators} />
      <Route path="/library" component={Library} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <TermsModal />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
