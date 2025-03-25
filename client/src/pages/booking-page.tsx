import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays, addDays } from "date-fns";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Loader2, CalendarIcon } from "lucide-react";

import { Vehicle, Booking } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const bookingFormSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  includeDriver: z.boolean().default(false),
}).refine(data => differenceInDays(data.endDate, data.startDate) >= 0, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch vehicle details
  const { data: vehicle, isLoading: vehicleLoading, error: vehicleError } = useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch vehicle details");
      }
      return response.json();
    },
    retry: 2,
  });

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      phoneNumber: user?.phoneNumber || "",
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      includeDriver: false,
    },
  });

  // Calculate total price
  const calculateTotalPrice = (values: Partial<BookingFormValues>) => {
    if (!vehicle || !values.startDate || !values.endDate) return 0;
    
    const days = Math.max(1, differenceInDays(values.endDate, values.startDate) + 1);
    let price = Number(vehicle.pricePerDay) * days;
    
    if (values.includeDriver) {
      price += price * 0.25;
    }
    
    return price;
  };

  // Update price when form changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      setTotalPrice(calculateTotalPrice(values));
    });
    return () => subscription.unsubscribe();
  }, [form.watch, vehicle]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (formData: BookingFormValues) => {
      const bookingData = {
        vehicleId: id,
        userId: user!.id,
        phoneNumber: formData.phoneNumber,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        includeDriver: formData.includeDriver,
        totalPrice: totalPrice.toFixed(2),
        status: "pending" // Default status
      };

      const response = await apiRequest("POST", "/api/bookings", bookingData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Booking failed");
      }
      return response.json() as Promise<Booking>;
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking created",
        description: "Proceeding to payment",
      });
      navigate(`/checkout/${booking.id}`); 
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (vehicleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (vehicleError || !vehicle) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <h1 className="text-xl font-bold text-red-500 mb-2">Error Loading Vehicle</h1>
              <p className="text-gray-600">
                {vehicleError instanceof Error ? vehicleError.message : "Vehicle not found"}
              </p>
              <Button 
                className="mt-4 w-full" 
                variant="outline"
                onClick={() => navigate("/vehicles")}
              >
                Back to Vehicles
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate(`/vehicles/${id}`)}
          >
            &larr; Back to Vehicle
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Book {vehicle.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Booking Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createBookingMutation.mutate(data))} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => 
                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => {
                                        const startDate = form.getValues("startDate");
                                        return date < startDate;
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="includeDriver"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Include Driver</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Add a professional driver for an additional 25%
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={createBookingMutation.isPending}
                      >
                        {createBookingMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          "Continue to Payment"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            {/* Right: Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={vehicle.imageUrl} 
                      alt={vehicle.name} 
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="font-medium">{vehicle.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{vehicle.type}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Base price</span>
                      <span>${vehicle.pricePerDay}/day</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Duration</span>
                      <span>
                        {form.watch("startDate") && form.watch("endDate") ? 
                          `${differenceInDays(form.watch("endDate"), form.watch("startDate")) + 1} days` : 
                          "1 day"}
                      </span>
                    </div>
                    
                    {form.watch("includeDriver") && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Driver (+25%)</span>
                        <span>Yes</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
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