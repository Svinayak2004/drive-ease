import { users, vehicles, bookings, type User, type InsertUser, type Vehicle, type InsertVehicle, type Booking, type InsertBooking } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle methods
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicles(type?: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicleAvailability(id: number, available: boolean): Promise<Vehicle | undefined>;
  
  // Booking methods
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private bookings: Map<number, Booking>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private vehicleIdCounter: number;
  private bookingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.bookings = new Map();
    this.userIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.bookingIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with some vehicles
    this.initializeVehicles();
  }

  private initializeVehicles() {
    const vehicles: InsertVehicle[] = [
      {
        name: 'Toyota Corolla',
        type: 'car',
        pricePerDay: 25,
        description: 'Comfortable sedan perfect for city driving and short trips.',
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        available: true
      },
      {
        name: 'Honda Civic',
        type: 'car',
        pricePerDay: 28,
        description: 'Reliable and fuel-efficient compact car for everyday use.',
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        available: true
      },
      {
        name: 'Mountain Bike',
        type: 'bike',
        pricePerDay: 10,
        description: 'Perfect for trails and outdoor adventures.',
        imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9c76792fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        available: true
      },
      {
        name: 'City Cruiser Bike',
        type: 'bike',
        pricePerDay: 8,
        description: 'Comfortable bike for casual city rides.',
        imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        available: true
      },
      {
        name: 'Mini Bus (15 seats)',
        type: 'bus',
        pricePerDay: 85,
        description: 'Perfect for small group trips and events.',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        available: true
      },
      {
        name: 'Shuttle Bus (25 seats)',
        type: 'bus',
        pricePerDay: 120,
        description: 'Ideal for larger groups and campus events.',
        imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        available: true
      }
    ];
    
    vehicles.forEach(vehicle => this.createVehicle(vehicle));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Vehicle methods
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async getVehicles(type?: string): Promise<Vehicle[]> {
    const allVehicles = Array.from(this.vehicles.values());
    if (type) {
      return allVehicles.filter(vehicle => vehicle.type === type);
    }
    return allVehicles;
  }
  
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const vehicle: Vehicle = { ...insertVehicle, id };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  async updateVehicleAvailability(id: number, available: boolean): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, available };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  
  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.userId === userId
    );
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const now = new Date();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      paymentIntentId: null, 
      status: 'pending',
      createdAt: now
    };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { 
      ...booking, 
      status,
      ...(paymentIntentId ? { paymentIntentId } : {})
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
}

export const storage = new MemStorage();
