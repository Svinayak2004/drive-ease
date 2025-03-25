import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleFilter from "@/components/vehicles/VehicleFilter";
import { Vehicle } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function VehiclesPage() {
  const { search } = useSearch();
  const queryParams = new URLSearchParams(search);
  const initialType = queryParams.get('type') || 'all';
  
  const [activeFilter, setActiveFilter] = useState<string>(initialType);
  
  const { data: vehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });
  
  // Apply filters
  const filteredVehicles = vehicles?.filter(vehicle => {
    if (activeFilter === 'all') return true;
    return vehicle.type === activeFilter;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-8 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Vehicles</h1>
            <p className="text-gray-600">Browse our selection of vehicles for your next trip</p>
          </div>
          
          <VehicleFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading vehicles. Please try again later.</p>
            </div>
          ) : filteredVehicles && filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {filteredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No vehicles found matching the selected filters.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
