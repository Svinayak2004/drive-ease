import { Search, Calendar, Car } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Choose Your Vehicle",
    description: "Browse our selection of vehicles and find the perfect one for your needs."
  },
  {
    icon: Calendar,
    title: "2. Book & Pay",
    description: "Select your dates, complete your booking, and make a secure payment online."
  },
  {
    icon: Car,
    title: "3. Enjoy Your Ride",
    description: "Pick up your vehicle and start your journey with confidence."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-16">How RideRentals Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-primary mb-6">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              
              {/* Connector line (only visible on md screens and up) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2">
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
