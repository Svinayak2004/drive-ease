import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/booking/BookingForm";
import PaymentForm from "@/components/booking/PaymentForm";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("details");
  const [bookingData, setBookingData] = useState<{
    startDate: Date | null;
    endDate: Date | null;
    withDriver: boolean;
    totalDays: number;
    totalPrice: number;
    bookingId?: number;
  }>({
    startDate: null,
    endDate: null,
    withDriver: false,
    totalDays: 0,
    totalPrice: 0
  });
  
  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${id}`],
  });
  
  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking created",
        description: "Please proceed to payment",
      });
      setBookingData(prev => ({
        ...prev,
        bookingId: data.id
      }));
      setActiveTab("payment");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const paymentConfirmMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/payment-confirmation", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment successful",
        description: "Your booking has been confirmed!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Payment confirmation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleBookingSubmit = async (data: any) => {
    if (!vehicle || !user) return;
    
    await createBookingMutation.mutateAsync({
      vehicleId: vehicle.id,
      startDate: data.startDate,
      endDate: data.endDate,
      withDriver: data.withDriver,
      totalPrice: bookingData.totalPrice
    });
  };
  
  const handlePaymentSuccess = async (paymentId: string) => {
    if (!bookingData.bookingId) return;
    
    await paymentConfirmMutation.mutateAsync({
      bookingId: bookingData.bookingId,
      paymentId
    });
  };
  
  if (isLoading || !vehicle) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-8 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
            <p className="text-gray-600">Book {vehicle.name} for your next adventure</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Booking Details</TabsTrigger>
                      <TabsTrigger value="payment" disabled={!bookingData.bookingId}>Payment</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details">
                      <BookingForm 
                        vehicle={vehicle} 
                        user={user} 
                        bookingData={bookingData}
                        setBookingData={setBookingData}
                        onSubmit={handleBookingSubmit}
                        isSubmitting={createBookingMutation.isPending}
                      />
                    </TabsContent>
                    
                    <TabsContent value="payment">
                      <PaymentForm 
                        bookingData={bookingData}
                        onPaymentSuccess={handlePaymentSuccess}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Order Summary */}
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                  
                  <div className="mb-4">
                    <img 
                      src={vehicle.imageUrl} 
                      alt={vehicle.name} 
                      className="w-full h-40 object-cover rounded-md mb-4"
                    />
                    <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                    <p className="text-gray-500">{vehicle.category}</p>
                  </div>
                  
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">{vehicle.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rental Period:</span>
                      <span className="font-medium">
                        {bookingData.totalDays > 0 ? `${bookingData.totalDays} Days` : 'Not selected'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Rate:</span>
                      <span>${vehicle.pricePerDay} × {bookingData.totalDays > 0 ? bookingData.totalDays : '0'} days</span>
                    </div>
                    
                    {bookingData.withDriver && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver Fee:</span>
                        <span>$25 × {bookingData.totalDays > 0 ? bookingData.totalDays : '0'} days</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student Discount:</span>
                      <span className="text-green-600">-${((vehicle.pricePerDay * bookingData.totalDays) * 0.15).toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold">${bookingData.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
