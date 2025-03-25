import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">DrivEase</h3>
            <p className="text-gray-400">Student-run vehicle rental service offering affordable transportation solutions for campus life and beyond.</p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link href="/vehicles" className="text-gray-400 hover:text-white">Vehicles</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Vehicle Types</h3>
            <ul className="space-y-2">
              <li><Link href="/vehicles?type=car" className="text-gray-400 hover:text-white">Cars</Link></li>
              <li><Link href="/vehicles?type=bike" className="text-gray-400 hover:text-white">Bikes</Link></li>
              <li><Link href="/vehicles?type=bus" className="text-gray-400 hover:text-white">Buses</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2"></i>
                <span>123 University Ave, College Town, ST 12345</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-2"></i>
                <span>info@driveaserentals.com</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone mt-1 mr-2"></i>
                <span>(123) 456-7890</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} DrivEase. All rights reserved. A student project from Engineering University.</p>
        </div>
      </div>
    </footer>
  );
}
