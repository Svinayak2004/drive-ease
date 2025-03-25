import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section id="home" className="relative bg-gray-900 text-white">
      <div 
        className="absolute inset-0 bg-black opacity-50"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay"
        }}
      ></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="md:w-2/3">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Rent the Perfect Vehicle for Your Next Adventure</h1>
          <p className="text-lg md:text-xl mb-8">Choose from our wide selection of cars, bikes, and buses at affordable student prices.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/vehicles" className="bg-primary hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md text-center transition">
              Browse Vehicles
            </Link>
            <Link href="#how-it-works" className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-md text-center transition">
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
