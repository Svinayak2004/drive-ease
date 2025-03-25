import { Link, useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import AuthModal from "@/components/modals/AuthModal";

export default function HomePage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("signup");

  const openLoginModal = () => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalTab("signup");
    setAuthModalOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Journey, Our Wheels</h1>
              <p className="text-lg mb-8">Affordable vehicle rentals for students, by students. Choose from cars, bikes, and buses for your next adventure.</p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  <Link href="/vehicles">
                    Explore Vehicles
                  </Link>
                </Button>
                
                {!user ? (
                  <Button 
                    size="lg" 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={openSignupModal}
                  >
                    Get Started
                  </Button>
                ) : (
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Link href="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="lg:w-1/2 mt-10 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Student renting a car" 
                className="rounded-lg shadow-xl w-full h-auto object-cover" 
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Choose DrivEase?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">We understand student needs and budgets. Our service is designed to make vehicle rental simple and affordable.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-money-bill-wave text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Student-Friendly Prices</h3>
                <p className="text-gray-600">Special rates for students with valid ID. Save more for longer rentals.</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-car-side text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Diverse Vehicle Options</h3>
                <p className="text-gray-600">Choose from cars, bikes, and buses depending on your needs and group size.</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-tie text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Optional Drivers</h3>
                <p className="text-gray-600">Don't have a license? No problem! Add a driver to your booking.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicle Categories */}
        <section id="vehicles" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Browse Our Vehicles</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find the perfect ride for your next trip or adventure.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Cars" 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Cars</h3>
                  <p className="text-gray-600 mb-4">Comfortable sedans and hatchbacks perfect for city driving and short trips.</p>
                  <p className="text-primary font-semibold mb-4">Starting from ₹2500/day</p>
                  <Button 
                    asChild 
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Link href="/vehicles?type=car">
                      View Cars
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Bikes" 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Bikes</h3>
                  <p className="text-gray-600 mb-4">Eco-friendly and budget options for solo travelers and adventure seekers.</p>
                  <p className="text-primary font-semibold mb-4">Starting from ₹1500/day</p>
                  <Button 
                    asChild 
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Link href="/vehicles?type=bike">
                      View Bikes
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Buses" 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Buses</h3>
                  <p className="text-gray-600 mb-4">Perfect for group trips, events, and large gatherings of students.</p>
                  <p className="text-primary font-semibold mb-4">Starting from ₹9999/day</p>
                  <Button 
                    asChild 
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Link href="/vehicles?type=bus">
                      View Buses
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Renting a vehicle with DrivEase is simple and straightforward.</p>
            </div>
            
            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-primary/20 z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Create an Account</h3>
                  <p className="text-gray-600">Sign up with your student email to access special rates.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Choose a Vehicle</h3>
                  <p className="text-gray-600">Browse our selection and find the perfect vehicle for your needs.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">3</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Book & Pay</h3>
                  <p className="text-gray-600">Select your dates and complete the secure payment process.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">4</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Enjoy Your Ride</h3>
                  <p className="text-gray-600">Pick up your vehicle and start your adventure!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">What Students Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Hear from fellow students who have used our service.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="text-amber-500 flex">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"Perfect for our weekend trip! The booking process was super easy and the prices were much better than other rental services. Will definitely use again."</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                    <p className="text-sm text-gray-500">Engineering Student</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="text-amber-500 flex">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"Rented a bus for our club's field trip. The driver option was a lifesaver! The whole process was smooth and the vehicle was in great condition."</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Sarah Miller</p>
                    <p className="text-sm text-gray-500">Club President</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="text-amber-500 flex">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"As an international student without a car, this service has been a game-changer! Affordable bikes for daily commute and cars for weekend trips."</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Miguel Fernandez</p>
                    <p className="text-sm text-gray-500">Computer Science Major</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Hit the Road?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">Join hundreds of students who trust DrivEase for their transportation needs. Sign up today and get a 10% discount on your first rental!</p>
            <div className="flex flex-wrap justify-center gap-4">
              {!user ? (
                <>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="bg-white text-primary hover:bg-gray-100"
                    onClick={openSignupModal}
                  >
                    Create Account
                  </Button>
                  <Button
                    asChild 
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary"
                  >
                    <Link href="/vehicles">
                      View All Vehicles
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  asChild 
                  variant="outline"
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  <Link href="/vehicles">
                    View All Vehicles
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab}
      />
    </div>
  );
}
