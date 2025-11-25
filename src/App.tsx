import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Plans from "@/pages/Plans";
import Checkout from "@/pages/Checkout";
import Applications from "@/pages/Applications";
import Dashboard from "@/pages/Dashboard";
import PagamentoPix from "@/pages/PagamentoPix";
import Account from "@/pages/Account";
import Tutoriais from "@/pages/Tutoriais";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "./hooks/useDiscordAuth";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:id" element={<Dashboard />} />
            <Route path="/pagamento/:id" element={<PagamentoPix />} />
            <Route path="/account" element={<Account />} />
            <Route path="/tutoriais" element={<Tutoriais />} />
            <Route path="/7x9k2m-panel-admin-2024" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
