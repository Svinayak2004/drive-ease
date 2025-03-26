import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, CalendarDays, MapPin, Users } from "lucide-react";
import { Vehicle, Booking } from "@shared/schema";
import { format } from "date-fns";

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const [_, navigate] = useLocation();

  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
  });

  // Fetch vehicle details if we have a booking
  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${booking?.vehicleId}`],
    enabled: !!booking,
  });

  const isLoading = bookingLoading || vehicleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <p className="text-gray-600">We couldn't find your booking details. Please check your bookings in the dashboard.</p>
              <Button 
                className="mt-4 w-full" 
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
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
        <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
            <p className="mt-2 text-gray-600">Your booking has been successfully processed and confirmed.</p>
          </div>
          
          <Card className="overflow-hidden">
            <div className="h-40 bg-primary/90 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-xl font-semibold">Thank You For Your Booking</h2>
                  <p className="text-sm mt-1 opacity-90">Confirmation #: {booking.id}</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="md:w-1/3">
                  <img 
                    src={vehicle.imageUrl} 
                    alt={vehicle.name} 
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
                
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold">{vehicle.name}</h2>
                    <p className="text-gray-500 capitalize">{vehicle.type}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{format(new Date(booking.startDate), "MMMM d, yyyy")}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{format(new Date(booking.endDate), "MMMM d, yyyy")}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Driver</p>
                      <p className="font-medium">{booking.includeDriver ? "Included" : "Not Included"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-medium">₹{Number(booking.totalPrice).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Pickup Location</h4>
                        <p className="text-sm text-gray-600">
                          DrivEase Campus Office, 123 University Ave
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CalendarDays className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Pickup Time</h4>
                        <p className="text-sm text-gray-600">
                          10:00 AM on {format(new Date(booking.startDate), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Please bring your student ID and driver's license for verification.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>A security deposit of ₹10000 will be held during your rental period.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Contact our support team at (123) 456-7890 if you have any questions.</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  className="sm:flex-1"
                  onClick={() => window.print()}
                >
                  Print Confirmation
                </Button>
                <Button
                  className="sm:flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/dashboard")}
                >
                  View All Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
