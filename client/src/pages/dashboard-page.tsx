import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, MapPin, CarFront, User, CalendarDays } from "lucide-react";
import { Vehicle, Booking } from "@shared/schema";
import { format, isPast, isFuture, isToday } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

// Custom hook for fetching vehicle details
const useVehicle = (vehicleId: string) => {
  return useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle");
      }
      return response.json();
    },
    enabled: !!vehicleId,
  });
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Fetch user's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    },
  });

  if (bookingsLoading) {
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

  // Filter bookings based on date
  const upcomingBookings = bookings?.filter(booking => 
    isFuture(new Date(booking.endDate)) || isToday(new Date(booking.endDate))
  ) || [];
  
  const pastBookings = bookings?.filter(booking => 
    isPast(new Date(booking.endDate)) && !isToday(new Date(booking.endDate))
  ) || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* User Profile Section */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => navigate("/vehicles")}
                  >
                    Book a Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Bookings Section */}
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>View and manage your vehicle rentals</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                  <TabsTrigger value="upcoming" className="relative">
                    Upcoming
                    {upcomingBookings.length > 0 && (
                      <Badge className="ml-2 bg-primary">{upcomingBookings.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past Bookings
                    {pastBookings.length > 0 && (
                      <Badge className="ml-2">{pastBookings.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-6">
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Upcoming Bookings</h3>
                      <p className="text-gray-500 mb-4">You don't have any upcoming vehicle rentals.</p>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => navigate("/vehicles")}
                      >
                        Book a Vehicle
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {upcomingBookings.map(booking => (
                        <BookingCardWithVehicle 
                          key={booking.id} 
                          booking={booking} 
                          isUpcoming={true}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past" className="mt-6">
                  {pastBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Past Bookings</h3>
                      <p className="text-gray-500">Your booking history will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pastBookings.map(booking => (
                        <BookingCardWithVehicle 
                          key={booking.id} 
                          booking={booking} 
                          isUpcoming={false}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Separate component to handle vehicle fetching
function BookingCardWithVehicle({ booking, isUpcoming }: { booking: Booking; isUpcoming: boolean }) {
  const { data: vehicle, isLoading } = useVehicle(booking.vehicleId.toString());
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <BookingCard 
      booking={booking} 
      vehicle={vehicle} 
      isUpcoming={isUpcoming} 
    />
  );
}

interface BookingCardProps {
  booking: Booking;
  vehicle?: Vehicle;
  isUpcoming: boolean;
}

function BookingCard({ booking, vehicle, isUpcoming }: BookingCardProps) {
  const [_, navigate] = useLocation();
  
  return (
    <Card className="overflow-hidden">
      <div className="sm:flex">
        <div className="sm:w-1/3 h-48 sm:h-auto">
          <img 
            src={vehicle?.imageUrl || "/placeholder-car.jpg"} 
            alt={vehicle?.name || "Vehicle"} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5 sm:w-2/3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h3 className="text-lg font-bold">{vehicle?.name || "Unknown Vehicle"}</h3>
              <p className="text-gray-500 capitalize">{vehicle?.type || "Unknown type"}</p>
            </div>
            <Badge className={isUpcoming ? "bg-green-500" : "bg-gray-500"}>
              {booking.status}
            </Badge>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-2">
              <CalendarDays className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Rental Period</p>
                <p className="font-medium">
                  {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-medium">Campus Office</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="text-lg font-bold text-primary">₹{Number(booking.totalPrice).toFixed(2)}</p>
            </div>
            
            {isUpcoming && (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate(`/confirmation/${booking.id}`)}
              >
                View Details
              </Button>
            )}
            
            {!isUpcoming && (
              <Button
                variant="outline"
                onClick={() => navigate(`/vehicles/${vehicle?.id}`)}
              >
                Book Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}