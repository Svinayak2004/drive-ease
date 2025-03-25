import { Link } from "wouter";
import { Car, MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <Car className="text-primary h-6 w-6 mr-2" />
              <span className="text-xl font-semibold">RideRentals</span>
            </div>
            <p className="text-gray-400 mb-4">Affordable vehicle rentals for students, by students.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link href="/vehicles" className="text-gray-400 hover:text-white transition">Vehicles</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-400 hover:text-white transition">How It Works</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Vehicle Types</h3>
            <ul className="space-y-2">
              <li><Link href="/vehicles?type=car" className="text-gray-400 hover:text-white transition">Cars</Link></li>
              <li><Link href="/vehicles?type=bike" className="text-gray-400 hover:text-white transition">Bikes</Link></li>
              <li><Link href="/vehicles?type=bus" className="text-gray-400 hover:text-white transition">Buses</Link></li>
              <li><Link href="/vehicles" className="text-gray-400 hover:text-white transition">Premium Vehicles</Link></li>
              <li><Link href="/vehicles" className="text-gray-400 hover:text-white transition">With Driver</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-2 text-gray-400" />
                <span className="text-gray-400">123 University Ave, Campus Area, City, State 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">info@riderentals.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">Mon-Fri: 9AM-6PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} RideRentals. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
