import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import AuthModal from "../modals/AuthModal";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");

  const openLoginModal = () => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalTab("signup");
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary">Driv<span className="text-green-500">Ease</span></span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className={`${location === "/" ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Home
                </Link>
                <Link href="/vehicles" className={`${location === "/vehicles" ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Vehicles
                </Link>
                <Link href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About Us
                </Link>
                <Link href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Contact
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Button 
                    variant="outline" 
                    className="ml-2" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Log out"}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600" 
                    onClick={openLoginModal}
                  >
                    Log in
                  </Button>
                  <Button 
                    className="ml-2 bg-primary hover:bg-primary/90" 
                    onClick={openSignupModal}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? "" : "hidden"} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className={`${location === "/" ? "bg-primary-50 border-primary text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Home
            </Link>
            <Link href="/vehicles" className={`${location === "/vehicles" ? "bg-primary-50 border-primary text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Vehicles
            </Link>
            <Link href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              About Us
            </Link>
            <Link href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Contact
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 flex flex-col space-y-2 px-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-center block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium border border-gray-300">
                  Dashboard
                </Link>
                <Button 
                  variant="default" 
                  className="text-center block" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="text-center block" 
                  onClick={openLoginModal}
                >
                  Log in
                </Button>
                <Button 
                  className="text-center block bg-primary hover:bg-primary/90" 
                  onClick={openSignupModal}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab}
      />
    </>
  );
}
