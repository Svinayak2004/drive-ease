import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Ready to Start Your Journey?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          Join hundreds of students who trust RideRentals for their transportation needs. Sign up today and get 10% off your first rental!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/auth" 
            className="bg-white hover:bg-gray-100 text-primary font-medium py-3 px-6 rounded-md transition"
          >
            Sign Up Now
          </Link>
          <Link 
            href="/vehicles" 
            className="bg-transparent border border-white text-white hover:bg-blue-600 font-medium py-3 px-6 rounded-md transition"
          >
            Browse Vehicles
          </Link>
        </div>
      </div>
    </section>
  );
}
