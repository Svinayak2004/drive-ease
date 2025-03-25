import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { differenceInDays, addDays, format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Vehicle } from "@shared/schema";

interface BookingFormProps {
  vehicle: Vehicle;
  user: any;
  bookingData: {
    startDate: Date | null;
    endDate: Date | null;
    withDriver: boolean;
    totalDays: number;
    totalPrice: number;
  };
  setBookingData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  studentId: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  withDriver: z.boolean().default(false),
}).refine(data => {
  return differenceInDays(data.endDate, data.startDate) >= 1;
}, {
  message: "End date must be at least 1 day after start date",
  path: ["endDate"],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingForm({ 
  vehicle, 
  user, 
  bookingData, 
  setBookingData, 
  onSubmit,
  isSubmitting 
}: BookingFormProps) {
  const [driverFee, setDriverFee] = useState<number>(25);
  const [studentDiscount, setStudentDiscount] = useState<number>(0.15); // 15% discount
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      phone: user?.phone || "",
      studentId: user?.studentId || "",
      startDate: new Date(),
      endDate: addDays(new Date(), 3),
      withDriver: false,
    },
  });
  
  // Watch for changes in the form fields to update the booking data
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const withDriver = form.watch("withDriver");
  
  // Update booking data state when form values change
  useEffect(() => {
    if (startDate && endDate) {
      const days = Math.max(1, differenceInDays(endDate, startDate));
      
      // Calculate the base price (vehicle price per day * days)
      let totalPrice = vehicle.pricePerDay * days;
      
      // Add driver fee if selected
      if (withDriver) {
        totalPrice += driverFee * days;
      }
      
      // Apply student discount
      const discountAmount = totalPrice * studentDiscount;
      totalPrice -= discountAmount;
      
      setBookingData({
        startDate,
        endDate,
        withDriver,
        totalDays: days,
        totalPrice
      });
    }
  }, [startDate, endDate, withDriver, vehicle.pricePerDay, driverFee, studentDiscount, setBookingData]);
  
  // Custom submit handler
  const handleSubmit = (data: BookingFormValues) => {
    onSubmit({
      ...data,
      totalPrice: bookingData.totalPrice
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="For student discount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Rental Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Pick-up Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
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
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                  <FormLabel>Return Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
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
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          (form.getValues().startDate && date <= form.getValues().startDate)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-4">
            <FormField
              control={form.control}
              name="withDriver"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Add a Driver (+${driverFee}/day)</FormLabel>
                    <p className="text-sm text-gray-500">Professional driver will be provided for your journey</p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
