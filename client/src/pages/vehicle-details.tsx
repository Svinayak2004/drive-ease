import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Star, Users, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${id}`],
  });
  
  const handleBookNow = () => {
    if (!user) {
      navigate(`/auth?redirect=/vehicles/${id}`);
    } else {
      navigate(`/booking/${id}`);
    }
  };
  
  if (isLoading) {
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
  
  if (error || !vehicle) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-500">Error loading vehicle details. Please try again later.</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const { rating, reviewCount } = vehicle;
  const ratingStars = rating / 10; // Convert from 0-50 scale to 0-5 scale
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-8 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Vehicle Image */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <img 
                  src={vehicle.imageUrl} 
                  alt={vehicle.name} 
                  className="w-full h-96 object-cover"
                />
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{vehicle.name}</h1>
                      <p className="text-gray-500">{vehicle.category}</p>
                    </div>
                    <Badge className={vehicle.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {vehicle.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex text-amber-400">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className={`h-5 w-5 ${ratingStars >= 4.5 ? "fill-current" : "stroke-current fill-none"}`} />
                    </div>
                    <span className="text-gray-600 text-sm ml-2">({ratingStars.toFixed(1)}/5)</span>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-600 mb-6">{vehicle.description}</p>
                  
                  <h2 className="text-xl font-semibold mb-2">Features</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicle.features?.map((feature, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Booking Card */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>Book this {vehicle.type} now</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-gray-600">Price per day:</span>
                      <span className="text-xl font-bold text-primary">${vehicle.pricePerDay}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Pick your dates to calculate total price</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Optional driver available for an additional fee</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleBookNow} 
                    className="w-full" 
                    disabled={!vehicle.available}
                  >
                    {vehicle.available ? "Book Now" : "Not Available"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Student Discount</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Show your student ID during pickup and get 15% off your rental!</p>
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
