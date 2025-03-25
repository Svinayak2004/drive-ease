import { Wallet, Shield, Users, Clock } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Student Discounts",
    description: "Special rates with valid student ID. Save up to 15% on all rentals."
  },
  {
    icon: Shield,
    title: "Fully Insured",
    description: "All our vehicles come with basic insurance coverage included."
  },
  {
    icon: Users,
    title: "Optional Drivers",
    description: "Add professional drivers for an additional fee if you prefer not to drive."
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our student-run support team is always ready to help you."
  }
];

export default function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Why Choose RideRentals</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">We provide affordable and reliable vehicle rentals designed specifically for students' needs.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-primary mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
