import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VehiclesPage from "@/pages/vehicles-page";
import VehicleDetailsPage from "@/pages/vehicle-details-page";
import BookingPage from "@/pages/booking-page";
import CheckoutPage from "@/pages/checkout-page";
import ConfirmationPage from "@/pages/confirmation-page";
import DashboardPage from "@/pages/dashboard-page";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/vehicles" component={VehiclesPage} />
      <Route path="/vehicles/:id" component={VehicleDetailsPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/booking/:id" component={BookingPage} />
      <ProtectedRoute path="/checkout/:bookingId" component={CheckoutPage} />
      <ProtectedRoute path="/confirmation/:bookingId" component={ConfirmationPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <main className={isMounted ? "fade-in" : ""}>
          <Router />
        </main>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
