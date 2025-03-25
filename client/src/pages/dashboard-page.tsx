import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingList from "@/components/dashboard/BookingList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["/api/bookings"],
  });
  
  // Separate bookings by status
  const upcomingBookings = bookings?.filter(
    booking => booking.status === "confirmed" || booking.status === "pending"
  );
  
  const pastBookings = bookings?.filter(
    booking => booking.status === "completed" || booking.status === "cancelled"
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-8 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600">Manage your bookings and account</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Account Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{user?.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>View and manage your rentals</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-500">Error loading bookings. Please try again later.</p>
                    </div>
                  ) : (
                    <Tabs defaultValue="upcoming">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upcoming">
                        <BookingList 
                          bookings={upcomingBookings || []} 
                          emptyMessage="You don't have any upcoming bookings." 
                        />
                      </TabsContent>
                      
                      <TabsContent value="past">
                        <BookingList 
                          bookings={pastBookings || []} 
                          emptyMessage="You don't have any past bookings." 
                        />
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
