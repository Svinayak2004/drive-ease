import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SearchBar from "@/components/home/SearchBar";
import VehicleCategories from "@/components/home/VehicleCategories";
import PopularVehicles from "@/components/home/PopularVehicles";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        <SearchBar />
        <VehicleCategories />
        <PopularVehicles />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
