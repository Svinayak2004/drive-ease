import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function VehiclesPage() {
  const [location, setLocation] = useLocation();
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("price-low");

  // Parse type from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get("type");
    if (typeParam) {
      setVehicleTypeFilter(typeParam);
    }
  }, [location]);

  // Fetch vehicles
  const { data: vehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Filter vehicles by type
  const filteredVehicles = vehicles?.filter(vehicle => {
    if (!vehicleTypeFilter) return true;
    return vehicle.type === vehicleTypeFilter;
  }) || [];

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortOrder === "price-low") {
      return Number(a.pricePerDay) - Number(b.pricePerDay);
    } else if (sortOrder === "price-high") {
      return Number(b.pricePerDay) - Number(a.pricePerDay);
    } else if (sortOrder === "name-asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  const handleFilterChange = (value: string) => {
    setVehicleTypeFilter(value === "all" ? null : value);
    // Update URL query parameter
    const params = new URLSearchParams(window.location.search);
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    setLocation(`/vehicles${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Our Vehicles</h1>
            <p className="mt-2 text-lg text-gray-600">Choose from our diverse selection of rental vehicles</p>
          </div>
          
          {/* Filters and Sorting */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Tabs 
              defaultValue={vehicleTypeFilter || "all"} 
              value={vehicleTypeFilter || "all"}
              onValueChange={handleFilterChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="car">Cars</TabsTrigger>
                <TabsTrigger value="bike">Bikes</TabsTrigger>
                <TabsTrigger value="bus">Buses</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="w-full sm:w-64">
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Vehicles Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load vehicles. Please try again later.</p>
            </div>
          ) : sortedVehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No vehicles found with the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={vehicle.imageUrl} 
                      alt={vehicle.name} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{vehicle.name}</CardTitle>
                        <CardDescription className="capitalize">{vehicle.type}</CardDescription>
                      </div>
                      <div className="text-primary font-bold">₹{Number(vehicle.pricePerDay)}/day</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 line-clamp-2">{vehicle.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      asChild
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Link href={`/vehicles/${vehicle.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
