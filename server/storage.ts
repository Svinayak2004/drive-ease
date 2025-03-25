import { type User, type InsertUser, type Vehicle, type InsertVehicle, type Booking, type InsertBooking } from "@shared/schema";
import session from "express-session";
import mongoose from 'mongoose';
import { UserModel, VehicleModel, BookingModel, sessionStore } from './db';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle methods
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicles(type?: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicleAvailability(id: string, available: boolean): Promise<Vehicle | undefined>;
  
  // Booking methods
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string, paymentIntentId?: string): Promise<Booking | undefined>;
  
  // Session store
  sessionStore: session.Store;
  
  // Initialize default data
  initializeDefaultData(): Promise<void>;
}

// MongoDB implementation of storage
export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;
  connected: boolean = false;
  
  constructor() {
    this.sessionStore = sessionStore;
    
    // We'll try connecting to MongoDB
    this.tryConnect();
  }
  
  private async tryConnect() {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental');
        console.log('Connected to MongoDB successfully');
        this.connected = true;
        await this.initializeDefaultData();
      }
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      this.connected = false;
    }
  }
  
  // Helper function to safely convert MongoDB document to User
  private toClientUser(doc: any): User {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      username: obj.username,
      password: obj.password,
      email: obj.email,
      firstName: obj.firstName,
      lastName: obj.lastName,
      phoneNumber: obj.phoneNumber || null
    };
  }
  
  // Helper function to safely convert MongoDB document to Vehicle
  private toClientVehicle(doc: any): Vehicle {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      name: obj.name,
      type: obj.type,
      pricePerDay: obj.pricePerDay,
      description: obj.description,
      imageUrl: obj.imageUrl,
      available: obj.available
    };
  }
  
  // Helper function to safely convert MongoDB document to Booking
  private toClientBooking(doc: any): Booking {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      userId: obj.userId.toString(),
      vehicleId: obj.vehicleId.toString(),
      startDate: obj.startDate,
      endDate: obj.endDate,
      includeDriver: obj.includeDriver,
      totalPrice: obj.totalPrice,
      paymentIntentId: obj.paymentIntentId,
      status: obj.status,
      createdAt: obj.createdAt
    };
  }

  // Initialize default data (vehicles)
  async initializeDefaultData(): Promise<void> {
    if (!this.connected) {
      console.log('MongoDB not connected, skipping default data initialization');
      return;
    }
    
    try {
      // Check if vehicles already exist
      const vehicleCount = await VehicleModel.countDocuments();
      if (vehicleCount === 0) {
        console.log('Initializing default vehicles...');
        const defaultVehicles: InsertVehicle[] = [
          {
            name: 'Toyota Corolla',
            type: 'car',
            pricePerDay: "25",
            description: 'Comfortable sedan perfect for city driving and short trips.',
            imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            available: true
          },
          {
            name: 'Honda Civic',
            type: 'car',
            pricePerDay: "28",
            description: 'Reliable and fuel-efficient compact car for everyday use.',
            imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            available: true
          },
          {
            name: 'Mountain Bike',
            type: 'bike',
            pricePerDay: "10",
            description: 'Perfect for trails and outdoor adventures.',
            imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9c76792fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            available: true
          },
          {
            name: 'City Cruiser Bike',
            type: 'bike',
            pricePerDay: "8",
            description: 'Comfortable bike for casual city rides.',
            imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            available: true
          },
          {
            name: 'Mini Bus (15 seats)',
            type: 'bus',
            pricePerDay: "85",
            description: 'Perfect for small group trips and events.',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            available: true
          },
          {
            name: 'Shuttle Bus (25 seats)',
            type: 'bus',
            pricePerDay: "120",
            description: 'Ideal for larger groups and campus events.',
            imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            available: true
          }
        ];

        for (const vehicle of defaultVehicles) {
          const newVehicle = new VehicleModel(vehicle);
          await newVehicle.save();
        }
        console.log('Default vehicles created successfully');
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id).lean();
      if (!user) return undefined;
      
      // Convert MongoDB document to User type
      return {
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username }).lean();
      if (!user) return undefined;
      
      return {
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email }).lean();
      if (!user) return undefined;
      
      return {
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const newUser = new UserModel({
        username: insertUser.username,
        password: insertUser.password,
        email: insertUser.email,
        firstName: insertUser.firstName,
        lastName: insertUser.lastName,
        phoneNumber: insertUser.phoneNumber || null,
      });
      
      const savedUser = await newUser.save();
      
      return {
        id: savedUser._id.toString(),
        username: savedUser.username,
        password: savedUser.password,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        phoneNumber: savedUser.phoneNumber,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Vehicle methods
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    try {
      const vehicle = await VehicleModel.findById(id).lean();
      if (!vehicle) return undefined;
      
      return {
        id: vehicle._id.toString(),
        name: vehicle.name,
        type: vehicle.type,
        pricePerDay: vehicle.pricePerDay,
        description: vehicle.description,
        imageUrl: vehicle.imageUrl,
        available: vehicle.available,
      };
    } catch (error) {
      console.error('Error getting vehicle:', error);
      return undefined;
    }
  }
  
  async getVehicles(type?: string): Promise<Vehicle[]> {
    try {
      const query = type ? { type } : {};
      const vehicles = await VehicleModel.find(query).lean();
      
      return vehicles.map(vehicle => ({
        id: vehicle._id.toString(),
        name: vehicle.name,
        type: vehicle.type,
        pricePerDay: vehicle.pricePerDay,
        description: vehicle.description,
        imageUrl: vehicle.imageUrl,
        available: vehicle.available,
      }));
    } catch (error) {
      console.error('Error getting vehicles:', error);
      return [];
    }
  }
  
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    try {
      const newVehicle = new VehicleModel({
        name: insertVehicle.name,
        type: insertVehicle.type,
        pricePerDay: insertVehicle.pricePerDay,
        description: insertVehicle.description,
        imageUrl: insertVehicle.imageUrl,
        available: insertVehicle.available === undefined ? true : Boolean(insertVehicle.available),
      });
      
      const savedVehicle = await newVehicle.save();
      
      return {
        id: savedVehicle._id.toString(),
        name: savedVehicle.name,
        type: savedVehicle.type,
        pricePerDay: savedVehicle.pricePerDay,
        description: savedVehicle.description,
        imageUrl: savedVehicle.imageUrl,
        available: savedVehicle.available,
      };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }
  
  async updateVehicleAvailability(id: string, available: boolean): Promise<Vehicle | undefined> {
    try {
      const updatedVehicle = await VehicleModel.findByIdAndUpdate(
        id,
        { available },
        { new: true }
      ).lean();
      
      if (!updatedVehicle) return undefined;
      
      return {
        id: updatedVehicle._id.toString(),
        name: updatedVehicle.name,
        type: updatedVehicle.type,
        pricePerDay: updatedVehicle.pricePerDay,
        description: updatedVehicle.description,
        imageUrl: updatedVehicle.imageUrl,
        available: updatedVehicle.available,
      };
    } catch (error) {
      console.error('Error updating vehicle availability:', error);
      return undefined;
    }
  }
  
  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    try {
      const booking = await BookingModel.findById(id).lean();
      if (!booking) return undefined;
      
      return {
        id: booking._id.toString(),
        userId: booking.userId.toString(),
        vehicleId: booking.vehicleId.toString(),
        startDate: booking.startDate,
        endDate: booking.endDate,
        includeDriver: booking.includeDriver,
        totalPrice: booking.totalPrice,
        paymentIntentId: booking.paymentIntentId,
        status: booking.status,
        createdAt: booking.createdAt,
      };
    } catch (error) {
      console.error('Error getting booking:', error);
      return undefined;
    }
  }
  
  async getBookingsByUser(userId: string): Promise<Booking[]> {
    try {
      const bookings = await BookingModel.find({ userId }).lean();
      
      return bookings.map(booking => ({
        id: booking._id.toString(),
        userId: booking.userId.toString(),
        vehicleId: booking.vehicleId.toString(),
        startDate: booking.startDate,
        endDate: booking.endDate,
        includeDriver: booking.includeDriver,
        totalPrice: booking.totalPrice,
        paymentIntentId: booking.paymentIntentId,
        status: booking.status,
        createdAt: booking.createdAt,
      }));
    } catch (error) {
      console.error('Error getting bookings by user:', error);
      return [];
    }
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    try {
      console.log('Creating booking in MongoDB:', insertBooking);
      
      // Convert string IDs to ObjectIds if needed
      const userId = typeof insertBooking.userId === 'string' 
        ? new mongoose.Types.ObjectId(insertBooking.userId)
        : insertBooking.userId;
        
      const vehicleId = typeof insertBooking.vehicleId === 'string'
        ? new mongoose.Types.ObjectId(insertBooking.vehicleId)
        : insertBooking.vehicleId;
      
      const newBooking = new BookingModel({
        userId,
        vehicleId,
        startDate: insertBooking.startDate instanceof Date 
          ? insertBooking.startDate 
          : new Date(insertBooking.startDate),
        endDate: insertBooking.endDate instanceof Date 
          ? insertBooking.endDate 
          : new Date(insertBooking.endDate),
        includeDriver: insertBooking.includeDriver === true,
        totalPrice: String(insertBooking.totalPrice),
        paymentIntentId: null,
        status: 'pending',
        createdAt: new Date()
      });
      
      const savedBooking = await newBooking.save();
      console.log('Booking saved in MongoDB:', savedBooking);
      
      return {
        id: savedBooking._id.toString(),
        userId: savedBooking.userId.toString(),
        vehicleId: savedBooking.vehicleId.toString(),
        startDate: savedBooking.startDate,
        endDate: savedBooking.endDate,
        includeDriver: savedBooking.includeDriver,
        totalPrice: savedBooking.totalPrice,
        paymentIntentId: savedBooking.paymentIntentId,
        status: savedBooking.status,
        createdAt: savedBooking.createdAt,
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }
  
  async updateBookingStatus(id: string, status: string, paymentIntentId?: string): Promise<Booking | undefined> {
    try {
      const updateData: any = { status };
      if (paymentIntentId) {
        updateData.paymentIntentId = paymentIntentId;
      }
      
      const updatedBooking = await BookingModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).lean();
      
      if (!updatedBooking) return undefined;
      
      return {
        id: updatedBooking._id.toString(),
        userId: updatedBooking.userId.toString(),
        vehicleId: updatedBooking.vehicleId.toString(),
        startDate: updatedBooking.startDate,
        endDate: updatedBooking.endDate,
        includeDriver: updatedBooking.includeDriver,
        totalPrice: updatedBooking.totalPrice,
        paymentIntentId: updatedBooking.paymentIntentId,
        status: updatedBooking.status,
        createdAt: updatedBooking.createdAt,
      };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }
  }
}

// Export singleton instance
export const storage = new MongoDBStorage();