import { Link } from "wouter";
import { Vehicle } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const { 
    id, 
    name, 
    category, 
    imageUrl, 
    pricePerDay, 
    available, 
    features,
    rating,
    reviewCount
  } = vehicle;
  
  // Convert rating from 0-50 scale to 0-5 scale
  const ratingStars = rating / 10;
  
  return (
    <div className="vehicle-card bg-white rounded-lg border border-gray-200 overflow-hidden transition transform hover:-translate-y-1 hover:shadow-md">
      <img 
        src={imageUrl} 
        alt={name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-gray-500 text-sm">{category}</p>
          </div>
          <Badge className={available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {available ? "Available" : "Booked"}
          </Badge>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`h-4 w-4 ${i < Math.floor(ratingStars) ? "fill-current" : "stroke-current fill-none"}`}
              />
            ))}
          </div>
          <span className="text-gray-600 text-sm ml-2">({ratingStars.toFixed(1)}/5)</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {features?.slice(0, 4).map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
              {feature}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-primary">${pricePerDay}/day</span>
          </div>
          <Link 
            href={`/vehicles/${id}`}
            className={`font-medium py-2 px-4 rounded-md transition ${
              available 
                ? "bg-primary hover:bg-blue-600 text-white" 
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {available ? "Book Now" : "Unavailable"}
          </Link>
        </div>
      </div>
    </div>
  );
}
