import { 
  users, type User, type InsertUser,
  vehicles, type Vehicle, type InsertVehicle,
  bookings, type Booking, type InsertBooking
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicles(): Promise<Vehicle[]>;
  getVehiclesByType(type: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicleAvailability(id: number, available: boolean): Promise<Vehicle | undefined>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string, paymentId?: string): Promise<Booking | undefined>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private vehiclesMap: Map<number, Vehicle>;
  private bookingsMap: Map<number, Booking>;
  
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentVehicleId: number;
  currentBookingId: number;

  constructor() {
    this.usersMap = new Map();
    this.vehiclesMap = new Map();
    this.bookingsMap = new Map();
    
    this.currentUserId = 1;
    this.currentVehicleId = 1;
    this.currentBookingId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with some sample vehicles
    this.initializeVehicles();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }

  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehiclesMap.get(id);
  }

  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehiclesMap.values());
  }
  
  async getVehiclesByType(type: string): Promise<Vehicle[]> {
    return Array.from(this.vehiclesMap.values())
      .filter(vehicle => vehicle.type === type);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = { ...insertVehicle, id };
    this.vehiclesMap.set(id, vehicle);
    return vehicle;
  }
  
  async updateVehicleAvailability(id: number, available: boolean): Promise<Vehicle | undefined> {
    const vehicle = this.vehiclesMap.get(id);
    if (vehicle) {
      const updatedVehicle = { ...vehicle, available };
      this.vehiclesMap.set(id, updatedVehicle);
      return updatedVehicle;
    }
    return undefined;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingsMap.get(id);
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookingsMap.values())
      .filter(booking => booking.userId === userId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const createdAt = new Date();
    const booking: Booking = { ...insertBooking, id, createdAt };
    this.bookingsMap.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string, paymentId?: string): Promise<Booking | undefined> {
    const booking = this.bookingsMap.get(id);
    if (booking) {
      const updatedBooking = { 
        ...booking, 
        status,
        ...(paymentId && { paymentId })
      };
      this.bookingsMap.set(id, updatedBooking);
      return updatedBooking;
    }
    return undefined;
  }
  
  // Initialize with some sample vehicles
  private initializeVehicles() {
    const sampleVehicles: InsertVehicle[] = [
      {
        name: "Toyota Corolla",
        type: "car",
        category: "Economy",
        description: "Reliable and fuel-efficient compact car, perfect for city driving.",
        pricePerDay: 32,
        imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        available: true,
        features: ["Manual", "4 Seats", "AC", "Bluetooth"],
        rating: 45,
        reviewCount: 12
      },
      {
        name: "Honda CBR",
        type: "bike",
        category: "Sport",
        description: "Sporty motorcycle with excellent handling and performance.",
        pricePerDay: 18,
        imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        available: true,
        features: ["600cc", "2 Seats", "Helmet"],
        rating: 40,
        reviewCount: 8
      },
      {
        name: "BMW 3 Series",
        type: "car",
        category: "Luxury",
        description: "Elegant luxury sedan with premium features and smooth performance.",
        pricePerDay: 58,
        imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        available: false,
        features: ["Automatic", "5 Seats", "AC", "Navigation"],
        rating: 49,
        reviewCount: 15
      },
      {
        name: "Mercedes Sprinter",
        type: "bus",
        category: "Minibus",
        description: "Spacious minibus ideal for group travel and events.",
        pricePerDay: 90,
        imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        available: true,
        features: ["Automatic", "12 Seats", "AC", "WiFi"],
        rating: 40,
        reviewCount: 6
      },
      {
        name: "Vespa Scooter",
        type: "bike",
        category: "City",
        description: "Stylish city scooter perfect for urban commuting.",
        pricePerDay: 12,
        imageUrl: "https://images.unsplash.com/photo-1599676821263-0cd72c777057?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        available: true,
        features: ["125cc", "2 Seats", "Helmet"],
        rating: 35,
        reviewCount: 10
      },
      {
        name: "Volkswagen Golf",
        type: "car",
        category: "Compact",
        description: "Popular compact car with great handling and fuel economy.",
        pricePerDay: 35,
        imageUrl: "https://images.unsplash.com/photo-1617624085810-3df2163d5384?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        available: true,
        features: ["Manual", "5 Seats", "AC", "Bluetooth"],
        rating: 42,
        reviewCount: 9
      }
    ];
    
    sampleVehicles.forEach(vehicle => {
      this.createVehicle(vehicle);
    });
  }
}

export const storage = new MemStorage();
