import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
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
}).refine(data => {
  return differenceInDays(data.endDate, data.startDate) >= 0;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingPage() {
  const { id } = useParams();
  const vehicleId = parseInt(id);
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Fetch vehicle details
  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
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

  // Update total price when form values change
  const calculateTotalPrice = (values: Partial<BookingFormValues>) => {
    if (!vehicle || !values.startDate || !values.endDate) return 0;
    
    const days = Math.max(1, differenceInDays(values.endDate, values.startDate) + 1);
    let price = Number(vehicle.pricePerDay) * days;
    
    // Add 25% extra for driver if included
    if (values.includeDriver) {
      price += price * 0.25;
    }
    
    return price;
  };

  // Watch form values to update price
  const watchedValues = form.watch();
  useState(() => {
    setTotalPrice(calculateTotalPrice(watchedValues));
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (formData: BookingFormValues) => {
      // Ensure the booking data is properly formatted for the API
      const bookingData = {
        vehicleId,
        userId: user!.id,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        includeDriver: formData.includeDriver || false, // Ensure it's always a boolean
        totalPrice: totalPrice.toString() // Convert to string as expected by API
      };
      
      console.log("Sending booking data:", bookingData);
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json() as Booking;
    },
    onSuccess: (booking: Booking) => {
      toast({
        title: "Booking created",
        description: "Proceeding to payment",
      });
      navigate(`/checkout/${booking.id}`);
    },
    onError: (error: any) => {
      console.error("Booking error:", error);
      let errorMessage = "Failed to create booking";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Booking failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    createBookingMutation.mutate(data);
  };

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

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <h1 className="text-xl font-bold text-red-500 mb-2">Error Loading Vehicle</h1>
              <p className="text-gray-600">Unable to load vehicle details. Please try again later.</p>
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
            onClick={() => navigate(`/vehicles/${vehicleId}`)}
          >
            &larr; Back to Vehicle
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Your Rental</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Booking Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        // If end date is before new start date, update end date
                                        const endDate = form.getValues("endDate");
                                        if (date && endDate && date > endDate) {
                                          form.setValue("endDate", addDays(date, 1));
                                        }
                                        setTotalPrice(calculateTotalPrice({
                                          ...form.getValues(),
                                          startDate: date || new Date()
                                        }));
                                      }}
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
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setTotalPrice(calculateTotalPrice({
                                          ...form.getValues(),
                                          endDate: date || addDays(new Date(), 1)
                                        }));
                                      }}
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
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    setTotalPrice(calculateTotalPrice({
                                      ...form.getValues(),
                                      includeDriver: checked
                                    }));
                                  }}
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
                      <span>${Number(vehicle.pricePerDay)}/day</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">
                        Duration
                      </span>
                      <span>
                        {watchedValues.startDate && watchedValues.endDate ? 
                          `${differenceInDays(watchedValues.endDate, watchedValues.startDate) + 1} days` : 
                          "1 day"}
                      </span>
                    </div>
                    
                    {watchedValues.includeDriver && (
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
