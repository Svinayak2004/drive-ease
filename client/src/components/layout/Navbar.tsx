import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetClose 
} from "@/components/ui/sheet";
import { Menu, Car, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [_, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  const navbarClasses = `bg-white transition-all duration-300 ${
    isScrolled ? "shadow-md" : ""
  }`;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "How It Works", path: "/#how-it-works" },
    { name: "About Us", path: "/#about" },
  ];

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Car className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-semibold text-gray-800">RideRentals</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className="px-3 py-2 text-gray-700 hover:text-primary transition"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 text-gray-700 hover:text-primary transition">
                  Dashboard
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  disabled={logoutMutation.isPending}
                  className="px-3 py-2 text-gray-700 hover:text-primary"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth" className="px-3 py-2 text-gray-700 hover:text-primary transition">
                  Login
                </Link>
                <Link href="/auth" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.path}>
                      <Link href={link.path} className="px-3 py-2 text-gray-700 hover:text-primary transition">
                        {link.name}
                      </Link>
                    </SheetClose>
                  ))}
                  
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link href="/dashboard" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary transition">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </SheetClose>
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout} 
                        disabled={logoutMutation.isPending}
                        className="justify-start px-3 py-2 text-gray-700 hover:text-primary"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/auth" className="px-3 py-2 text-gray-700 hover:text-primary transition">
                          Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/auth" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition text-center">
                          Sign Up
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
