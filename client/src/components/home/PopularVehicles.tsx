import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import { Loader2 } from "lucide-react";
import VehicleCard from "@/components/vehicles/VehicleCard";

export default function PopularVehicles() {
  const [filter, setFilter] = useState<string>("all");
  
  const { data: vehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });
  
  // Apply filter
  const filteredVehicles = vehicles?.filter(vehicle => {
    if (filter === "all") return true;
    return vehicle.type === filter;
  });
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Popular Vehicles</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md transition ${
                filter === "all" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("car")}
              className={`px-4 py-2 rounded-md transition ${
                filter === "car" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              Cars
            </button>
            <button 
              onClick={() => setFilter("bike")}
              className={`px-4 py-2 rounded-md transition ${
                filter === "bike" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              Bikes
            </button>
            <button 
              onClick={() => setFilter("bus")}
              className={`px-4 py-2 rounded-md transition ${
                filter === "bus" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              Buses
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading vehicles. Please try again later.</p>
          </div>
        ) : filteredVehicles && filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.slice(0, 6).map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No vehicles found matching the selected filter.</p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <a 
            href="/vehicles" 
            className="inline-block bg-white border border-primary text-primary hover:bg-primary hover:text-white font-medium py-2 px-6 rounded-md transition"
          >
            View All Vehicles
          </a>
        </div>
      </div>
    </section>
  );
}
