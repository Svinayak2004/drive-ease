import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users, CheckCircle } from "lucide-react";
import { Vehicle } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/modals/AuthModal";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch vehicle details
  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${id}`],
  });

  const handleBookNow = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      navigate(`/booking/${id}`);
    }
  };

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

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <h1 className="text-xl font-bold text-red-500 mb-2">Error Loading Vehicle</h1>
              <p className="text-gray-600">Unable to load vehicle details. Please try again later.</p>
              <Button 
                className="mt-4 w-full" 
                variant="outline"
                onClick={() => navigate("/vehicles")}
              >
                Back to Vehicles
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
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Back button */}
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate("/vehicles")}
          >
            &larr; Back to Vehicles
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Vehicle Image */}
            <div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img 
                  src={vehicle.imageUrl} 
                  alt={vehicle.name} 
                  className="w-full h-auto rounded-md"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">{vehicle.type}</Badge>
                  <Badge variant={vehicle.available ? "success" : "destructive"}>
                    {vehicle.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Right: Vehicle Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
                <div className="mt-2 flex items-center">
                  <span className="text-2xl font-bold text-primary">${Number(vehicle.pricePerDay)}</span>
                  <span className="text-gray-600 ml-1">/ day</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700">{vehicle.description}</p>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <span className="text-gray-700">Flexible rental periods</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <span className="text-gray-700">Optional driver available</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span className="text-gray-700">Student discounts available</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">How It Works</h2>
                <ol className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</span>
                    <span className="text-gray-700">Select your rental dates and book online</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</span>
                    <span className="text-gray-700">Complete the payment securely</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</span>
                    <span className="text-gray-700">Pick up your vehicle at the campus location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">4</span>
                    <span className="text-gray-700">Return the vehicle at the end of your rental period</span>
                  </li>
                </ol>
              </div>
              
              <Button 
                className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
                disabled={!vehicle.available}
                onClick={handleBookNow}
              >
                {vehicle.available ? "Book Now" : "Currently Unavailable"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab="login"
      />
    </div>
  );
}
