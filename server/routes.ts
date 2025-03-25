import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Warning: No Stripe secret key provided. Using test mode.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_example", {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      let vehicles;
      
      if (type && ["car", "bike", "bus"].includes(type)) {
        vehicles = await storage.getVehiclesByType(type);
      } else {
        vehicles = await storage.getVehicles();
      }
      
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vehicle" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { vehicleId, startDate, endDate, withDriver, totalPrice } = req.body;
      
      // Check if vehicle exists and is available
      const vehicle = await storage.getVehicle(parseInt(vehicleId));
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      if (!vehicle.available) {
        return res.status(400).json({ message: "Vehicle is not available" });
      }
      
      // Create booking
      const booking = await storage.createBooking({
        userId: req.user.id,
        vehicleId: parseInt(vehicleId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        withDriver: withDriver === true,
        totalPrice,
        status: "pending"
      });
      
      // Update vehicle availability
      await storage.updateVehicleAvailability(parseInt(vehicleId), false);
      
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Error creating booking" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const bookings = await storage.getBookingsByUser(req.user.id);
      
      // Get vehicle details for each booking
      const bookingsWithVehicles = await Promise.all(
        bookings.map(async (booking) => {
          const vehicle = await storage.getVehicle(booking.vehicleId);
          return {
            ...booking,
            vehicle
          };
        })
      );
      
      res.json(bookingsWithVehicles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });

  // Payment route
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId } = req.body;
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId,
          userId: req.user.id.toString()
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  
  // Payment confirmation webhook
  app.post("/api/payment-confirmation", async (req, res) => {
    try {
      const { bookingId, paymentId } = req.body;
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Update booking status
      const updatedBooking = await storage.updateBookingStatus(
        parseInt(bookingId), 
        "confirmed",
        paymentId
      );
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Error confirming payment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
