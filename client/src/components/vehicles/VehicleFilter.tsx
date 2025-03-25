import { Button } from "@/components/ui/button";

interface VehicleFilterProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export default function VehicleFilter({ activeFilter, setActiveFilter }: VehicleFilterProps) {
  const filters = [
    { id: "all", label: "All Vehicles" },
    { id: "car", label: "Cars" },
    { id: "bike", label: "Bikes" },
    { id: "bus", label: "Buses" }
  ];
  
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {filters.map(filter => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? "default" : "outline"}
          onClick={() => setActiveFilter(filter.id)}
          className={activeFilter === filter.id ? "bg-primary text-white" : ""}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
