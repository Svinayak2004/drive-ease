import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBookingSchema } from "@shared/schema";
import Stripe from "stripe";

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_your_test_key";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // Get all vehicles or filter by type
  app.get("/api/vehicles", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const vehicles = await storage.getVehicles(type);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vehicles" });
    }
  });

  // Get a specific vehicle by ID
  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vehicle" });
    }
  });

  // Get user's bookings
  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const bookings = await storage.getBookingsByUser(req.user.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });

  // Get a specific booking
  app.get("/api/bookings/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if booking belongs to current user
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to booking" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Error fetching booking" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      console.log("Received booking request:", req.body);
      
      // Make sure all required fields are present
      if (!req.body.vehicleId || !req.body.startDate || !req.body.endDate || !req.body.totalPrice) {
        return res.status(400).json({ 
          message: "Missing required booking fields", 
          error: "All required fields must be provided (vehicleId, startDate, endDate, totalPrice)" 
        });
      }
      
      // Ensure includeDriver is a boolean
      const includeDriver = req.body.includeDriver === true || req.body.includeDriver === "true";
      
      // Format booking data for API
      const bookingData = {
        userId: req.user.id,
        vehicleId: parseInt(req.body.vehicleId),
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        includeDriver: includeDriver,
        totalPrice: req.body.totalPrice
      };
      
      console.log("Processed booking data:", bookingData);
      
      // Check if vehicle exists and is available
      const vehicle = await storage.getVehicle(bookingData.vehicleId);
      if (!vehicle) {
        return res.status(400).json({ message: "Vehicle not found", error: "The requested vehicle does not exist" });
      }
      
      if (!vehicle.available) {
        return res.status(400).json({ message: "Vehicle not available", error: "The requested vehicle is not available for booking" });
      }
      
      // Create booking
      const booking = await storage.createBooking(bookingData);
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(500).json({ message: "Error creating booking", error: String(error) });
    }
  });

  // Create payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { bookingId } = req.body;
      
      // Get booking details
      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if booking belongs to current user
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to booking" });
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(booking.totalPrice) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: booking.id.toString(),
          userId: req.user.id.toString()
        }
      });
      
      // Update booking with payment intent ID
      await storage.updateBookingStatus(booking.id, "processing", paymentIntent.id);
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Confirm booking after payment
  app.post("/api/confirm-booking/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if booking belongs to current user
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to booking" });
      }
      
      // Update booking status to confirmed
      const updatedBooking = await storage.updateBookingStatus(bookingId, "confirmed");
      
      // Update vehicle availability to false
      await storage.updateVehicleAvailability(booking.vehicleId, false);
      
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Error confirming booking" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
