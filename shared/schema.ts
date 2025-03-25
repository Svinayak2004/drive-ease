import { pgTable, text, serial, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the database tables for PostgreSQL (using Drizzle)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // car, bike, bus
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  available: boolean("available").notNull().default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  includeDriver: boolean("include_driver").notNull().default(false),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  paymentIntentId: text("payment_intent_id"),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema validation for inserts
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional().nullable(),
});

export const insertVehicleSchema = z.object({
  name: z.string(),
  type: z.string(),
  pricePerDay: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  available: z.boolean().optional().default(true),
});

export const insertBookingSchema = z.object({
  userId: z.string(),
  vehicleId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  includeDriver: z.boolean().default(false),
  totalPrice: z.string(),
});

// Data types for MongoDB
export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  pricePerDay: string;
  description: string;
  imageUrl: string;
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  includeDriver: boolean;
  totalPrice: string;
  paymentIntentId: string | null;
  status: string;
  createdAt: Date;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
