import { Link } from "wouter";
import { Car, Bike, Bus } from "lucide-react";

const categories = [
  {
    title: "Cars",
    description: "From compact to luxury, find the perfect car for your needs",
    price: "₹25/day",
    icon: Car,
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    link: "/vehicles?type=car"
  },
  {
    title: "Bikes",
    description: "Explore the city on two wheels with our range of bikes",
    price: "₹10/day",
    icon: Bike,
    image: "https://images.unsplash.com/photo-1558980394-0a06c4631733?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    link: "/vehicles?type=bike"
  },
  {
    title: "Buses",
    description: "Perfect for group outings and special events",
    price: "r80/day",
    icon: Bus,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    link: "/vehicles?type=bus"
  }
];

export default function VehicleCategories() {
  return (
    <section id="vehicles" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Our Vehicle Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg"
            >
              <img 
                src={category.image} 
                alt={`${category.title} category`} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <p className="text-primary font-medium mb-4">Starting from {category.price}</p>
                <Link 
                  href={category.link} 
                  className="block text-center bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  View {category.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
