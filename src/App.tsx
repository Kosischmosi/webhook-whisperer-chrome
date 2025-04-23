
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Detektieren, ob wir in einer Chrome-Extension Umgebung sind
  const isExtension = typeof chrome !== 'undefined' && !!chrome?.runtime?.id;
  
  // RouterComponent wird basierend auf der Umgebung ausgewählt
  const RouterComponent = isExtension ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterComponent>
          <div className="scrollbar-fix" style={{ scrollbarGutter: 'stable', overflowY: 'scroll' }}>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </RouterComponent>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
