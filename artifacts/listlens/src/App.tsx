import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import HomePage from "@/pages/home";
import SplashPage from "@/pages/splash";
import DashboardPage from "@/pages/dashboard";
import BillingPage from "@/pages/billing";
import HistoryPage from "@/pages/history";
import LensesPage from "@/pages/lenses";
import RecordLensPage from "@/pages/lenses/record";
import SoleLensPrototype from "@/pages/lenses/Sole";
import ClothingLensPage from "@/pages/lenses/clothing";
import CardLensPage from "@/pages/lenses/card";
import ToyLensPage from "@/pages/lenses/toy";
import WatchLensPage from "@/pages/lenses/watch";
import MeasureLensPage from "@/pages/lenses/measure";
import MotorLensPage from "@/pages/lenses/motor";
import TechLensPage from "@/pages/lenses/tech";
import BookLensPage from "@/pages/lenses/book";
import AntiquesLensPage from "@/pages/lenses/antiques";
import AutographLensPage from "@/pages/lenses/autograph";
import NewStudioPage from "@/pages/studio/new";
import StudioItemPage from "@/pages/studio/detail";
import NewGuardPage from "@/pages/guard/new";
import GuardCheckPage from "@/pages/guard/detail";
import PrivacyPage from "@/pages/legal/privacy";
import TermsPage from "@/pages/legal/terms";
import AiDisclaimerPage from "@/pages/legal/ai-disclaimer";
import OfflinePage from "@/pages/offline";
import AdminLogsPage from "@/pages/admin/logs";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/splash" component={SplashPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/billing" component={BillingPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/lenses" component={LensesPage} />
      <Route path="/lenses/record" component={RecordLensPage} />
      <Route path="/lenses/sole" component={SoleLensPrototype} />
      <Route path="/lenses/lp" component={RecordLensPage} />
      <Route path="/lenses/clothing" component={ClothingLensPage} />
      <Route path="/lenses/card" component={CardLensPage} />
      <Route path="/lenses/toy" component={ToyLensPage} />
      <Route path="/lenses/watch" component={WatchLensPage} />
      <Route path="/lenses/measure" component={MeasureLensPage} />
      <Route path="/lenses/motor" component={MotorLensPage} />
      <Route path="/lenses/tech" component={TechLensPage} />
      <Route path="/lenses/book" component={BookLensPage} />
      <Route path="/lenses/antiques" component={AntiquesLensPage} />
      <Route path="/lenses/autograph" component={AutographLensPage} />
      <Route path="/studio/new" component={NewStudioPage} />
      <Route path="/studio/:id" component={StudioItemPage} />
      <Route path="/guard/new" component={NewGuardPage} />
      <Route path="/guard/:id" component={GuardCheckPage} />
      <Route path="/legal/privacy" component={PrivacyPage} />
      <Route path="/legal/terms" component={TermsPage} />
      <Route path="/legal/ai-disclaimer" component={AiDisclaimerPage} />
      <Route path="/offline" component={OfflinePage} />
      <Route path="/admin/logs" component={AdminLogsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
