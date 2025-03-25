import { IStorage } from './storage';
import { UserModel, VehicleModel, BookingModel } from './models';
import { User, InsertUser, Vehicle, InsertVehicle, Booking, InsertBooking } from '@shared/schema';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';

export class MongoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://svinayak2004:Suryawanshi%402004@cluster0.lz7si.mongodb.net/car-rental',
      collectionName: 'sessions'
    });
  }

  // Helper function to convert MongoDB _id to id for client compatibility
  private toClientUser(doc: any): User {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { id: _id.toString(), ...rest };
  }

  private toClientVehicle(doc: any): Vehicle {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { id: _id.toString(), ...rest };
  }

  private toClientBooking(doc: any): Booking {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { id: _id.toString(), ...rest };
  }

  // Connection management
  async connect(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental');
        console.log('Connected to MongoDB database');
      }
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    await this.connect();
    try {
      const user = await UserModel.findById(id);
      return user ? this.toClientUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.connect();
    try {
      const user = await UserModel.findOne({ username });
      return user ? this.toClientUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.connect();
    try {
      const user = await UserModel.findOne({ email });
      return user ? this.toClientUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    await this.connect();
    try {
      // Ensure phoneNumber is always a string or null, not undefined
      const userData = {
        ...user,
        phoneNumber: user.phoneNumber || null
      };
      const newUser = await UserModel.create(userData);
      return this.toClientUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Vehicle methods
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    await this.connect();
    try {
      const vehicle = await VehicleModel.findById(new mongoose.Types.ObjectId(id));
      return vehicle ? this.toClientVehicle(vehicle) : undefined;
    } catch (error) {
      console.error('Error getting vehicle:', error);
      return undefined;
    }
  }

  async getVehicles(type?: string): Promise<Vehicle[]> {
    await this.connect();
    try {
      const query = type ? { type } : {};
      const vehicles = await VehicleModel.find(query);
      return vehicles.map(vehicle => this.toClientVehicle(vehicle));
    } catch (error) {
      console.error('Error getting vehicles:', error);
      return [];
    }
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    await this.connect();
    try {
      // Ensure available is always a boolean
      const vehicleData = {
        ...vehicle,
        available: vehicle.available === undefined ? true : Boolean(vehicle.available)
      };
      const newVehicle = await VehicleModel.create(vehicleData);
      return this.toClientVehicle(newVehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  async updateVehicleAvailability(id: number, available: boolean): Promise<Vehicle | undefined> {
    await this.connect();
    try {
      const updatedVehicle = await VehicleModel.findByIdAndUpdate(
        id,
        { available },
        { new: true }
      );
      return updatedVehicle ? this.toClientVehicle(updatedVehicle) : undefined;
    } catch (error) {
      console.error('Error updating vehicle availability:', error);
      return undefined;
    }
  }

  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    await this.connect();
    try {
      const booking = await BookingModel.findById(id);
      return booking ? this.toClientBooking(booking) : undefined;
    } catch (error) {
      console.error('Error getting booking:', error);
      return undefined;
    }
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    await this.connect();
    try {
      const bookings = await BookingModel.find({ userId });
      return bookings.map(booking => this.toClientBooking(booking));
    } catch (error) {
      console.error('Error getting bookings by user:', error);
      return [];
    }
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    await this.connect();
    try {
      // Create booking with explicit type conversion to ensure proper types
      const bookingData = {
        userId: insertBooking.userId,
        vehicleId: insertBooking.vehicleId,
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
      };

      console.log("Creating booking in MongoDB:", bookingData);
      const newBooking = await BookingModel.create(bookingData);
      return this.toClientBooking(newBooking);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking | undefined> {
    await this.connect();
    try {
      const updateData: any = { status };
      if (paymentIntentId) {
        updateData.paymentIntentId = paymentIntentId;
      }

      const updatedBooking = await BookingModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      return updatedBooking ? this.toClientBooking(updatedBooking) : undefined;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }
  }

  // Initialize with demo vehicles if none exist
  async initializeVehicles() {
    await this.connect();
    try {
      const count = await VehicleModel.countDocuments();
      if (count === 0) {
        console.log('Initializing vehicles collection with demo data...');
        const vehicles = [
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

        await VehicleModel.insertMany(vehicles);
        console.log('Demo vehicles created successfully');
      }
    } catch (error) {
      console.error('Error initializing vehicles:', error);
    }
  }
}