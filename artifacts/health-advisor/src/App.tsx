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
import Medications from "@/pages/medications";
import Compare from "@/pages/compare";
import Family from "@/pages/family";
import CheckInPage from "@/pages/checkin";
import Goals from "@/pages/goals";
import Shared from "@/pages/shared";
import { TermsModal } from "@/components/TermsModal";
import { ChatWidget } from "@/components/ChatWidget";
import { useI18n, isRTL } from "@/lib/i18n";
import { useEffect } from "react";

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
      <Route path="/medications" component={Medications} />
      <Route path="/compare" component={Compare} />
      <Route path="/family" component={Family} />
      <Route path="/checkin" component={CheckInPage} />
      <Route path="/goals" component={Goals} />
      <Route path="/shared" component={Shared} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { lang } = useI18n();
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
  }, [lang]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <TermsModal />
        <ChatWidget />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
