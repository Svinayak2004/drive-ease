import { User } from "lucide-react";

const testimonials = [
  {
    content: "Perfect for our weekend trip! The car was clean and fuel-efficient. Will definitely use RideRentals again for my next adventure.",
    author: "Sarah Johnson",
    role: "Computer Science Student",
    rating: 5
  },
  {
    content: "Renting a bike was so easy! The online booking system is straightforward and the prices are really affordable for students like me.",
    author: "Mike Chen",
    role: "Engineering Student",
    rating: 4.5
  },
  {
    content: "We rented a minibus for our club's field trip. The vehicle was spacious and comfortable. The optional driver was professional and friendly.",
    author: "Alex Rodriguez",
    role: "Business Student",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-16">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill={i < Math.floor(testimonial.rating) ? "currentColor" : (i < testimonial.rating ? "currentColor" : "none")}
                    stroke="currentColor"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.author}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
