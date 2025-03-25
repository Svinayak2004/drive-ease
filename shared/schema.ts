import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  studentId: text("student_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  studentId: true,
});

// Vehicle schema
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'car', 'bike', 'bus'
  category: text("category").notNull(), // 'Economy', 'Luxury', 'Sport', etc.
  description: text("description"),
  pricePerDay: integer("price_per_day").notNull(),
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  features: text("features").array(),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  name: true,
  type: true,
  category: true,
  description: true,
  pricePerDay: true,
  imageUrl: true,
  available: true,
  features: true,
  rating: true,
  reviewCount: true,
});

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  withDriver: boolean("with_driver").default(false),
  totalPrice: integer("total_price").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  vehicleId: true,
  startDate: true,
  endDate: true,
  withDriver: true,
  totalPrice: true,
  status: true,
  paymentId: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
