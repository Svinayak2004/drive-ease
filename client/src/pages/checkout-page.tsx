import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, CreditCard, CalendarDays, Users } from "lucide-react";
import { Vehicle, Booking } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
  });

  // Fetch vehicle details if we have a booking
  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${booking?.vehicleId}`],
    enabled: !!booking,
  });

  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/create-payment-intent", { bookingId: parseInt(bookingId) });
      return await res.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment setup failed",
        description: error.message || "Failed to set up payment",
        variant: "destructive",
      });
      setStripeError(error.message || "Failed to set up payment");
    },
  });

  // Confirm booking mutation
  const confirmBookingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/confirm-booking/${bookingId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${bookingId}`] });
      navigate(`/confirmation/${bookingId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking confirmation failed",
        description: error.message || "Failed to confirm booking",
        variant: "destructive",
      });
    },
  });

  // Initialize payment intent when page loads
  useEffect(() => {
    if (booking && !clientSecret && !createPaymentIntentMutation.isPending) {
      createPaymentIntentMutation.mutate();
    }
  }, [booking, clientSecret, createPaymentIntentMutation]);

  // Simulate a successful payment (for demo purposes)
  const handleSimulatePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      confirmBookingMutation.mutate();
    }, 2000);
  };

  const isLoading = bookingLoading || vehicleLoading || createPaymentIntentMutation.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Setting up your payment...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking || !vehicle) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <h1 className="text-xl font-bold text-red-500 mb-2">Booking Not Found</h1>
              <p className="text-gray-600">We couldn't find your booking details. Please try again or contact support.</p>
              <Button 
                className="mt-4 w-full" 
                variant="outline"
                onClick={() => navigate("/vehicles")}
              >
                Browse Vehicles
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="mt-2 text-gray-600">You're just one step away from confirming your vehicle rental</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Booking Details */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                  <CardDescription>Review your booking details before payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={vehicle.imageUrl} 
                      alt={vehicle.name} 
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="font-medium">{vehicle.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{vehicle.type}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Rental Period</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(booking.startDate), "MMMM d, yyyy")} - {format(new Date(booking.endDate), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    
                    {booking.includeDriver && (
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Driver Included</h4>
                          <p className="text-sm text-gray-600">
                            A professional driver will be provided for your trip
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-medium text-lg">Payment Details</h3>
                    
                    <div className="text-gray-500 text-sm space-y-1">
                      <p>• Secure payment processing via Stripe</p>
                      <p>• No additional fees or hidden charges</p>
                      <p>• You will only be charged once you confirm your booking</p>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Amount</span>
                        <span>${Number(booking.totalPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {stripeError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                      <p className="font-semibold">Payment Error:</p>
                      <p>{stripeError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right: Payment Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                    
                    {/* For demo purposes, we're using a simplified payment form */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Card Details</p>
                        <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                          <span>●●●● ●●●● ●●●● 4242</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">Expiry</p>
                          <div className="border rounded px-3 py-2 bg-gray-50">
                            <span>12/25</span>
                          </div>
                        </div>
                        <div className="w-24">
                          <p className="text-sm text-gray-500 mb-1">CVC</p>
                          <div className="border rounded px-3 py-2 bg-gray-50">
                            <span>●●●</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
                onClick={handleSimulatePayment}
                disabled={processing || confirmBookingMutation.isPending}
              >
                {processing || confirmBookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>Pay ${Number(booking.totalPrice).toFixed(2)}</>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                <p>By clicking "Pay", you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
