import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import Organizations from "./pages/Organizations";
import Sessions from "./pages/Sessions";
import Scenarios from "./pages/Scenarios";
import Avatars from "./pages/Avatars";
import Roles from "./pages/Roles";
import PrecallPlans from "./pages/PrecallPlans";
import Documents from "./pages/Documents";
import Guardrails from "./pages/Guardrails";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/precall-plans" element={<PrecallPlans />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/guardrails" element={<Guardrails />} />
          <Route path="/categories" element={<Categories />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
