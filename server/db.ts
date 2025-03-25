import mongoose from 'mongoose';

// MongoDB connection string - using MongoDB Atlas free tier
// Replace this with your own MongoDB URI when in production
let MONGODB_URI = process.env.MONGODB_URI;

// If no valid URI is provided, use a fallback for development
if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb')) {
  console.warn('No valid MongoDB URI provided. Using in-memory MongoDB for development.');
  MONGODB_URI = 'mongodb://localhost:27017/car-rental-dev';
}

// Create a MongoDB connection
export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🚀 Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // Instead of exiting, we'll allow the app to continue with in-memory functionality
    if (MONGODB_URI === 'mongodb://localhost:27017/car-rental-dev') {
      console.log('Using in-memory storage instead of MongoDB');
      return false;
    }
    
    // Only exit if we're trying to use a real MongoDB connection
    console.log('MongoDB connection failed. Setting up application with in-memory database.');
    return false;
  }
}

// Create MongoDB models based on our schema
import { Schema, model, Document } from 'mongoose';

// User schema
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, default: null }
});

// Vehicle schema
export interface IVehicle extends Document {
  name: string;
  type: string;
  pricePerDay: string;
  description: string;
  imageUrl: string;
  available: boolean;
}

const vehicleSchema = new Schema<IVehicle>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  pricePerDay: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  available: { type: Boolean, default: true }
});

// Booking schema
export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  includeDriver: boolean;
  totalPrice: string;
  paymentIntentId: string | null;
  status: string;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  includeDriver: { type: Boolean, default: false },
  totalPrice: { type: String, required: true },
  paymentIntentId: { type: String, default: null },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Export models
export const UserModel = model<IUser>('User', userSchema);
export const VehicleModel = model<IVehicle>('Vehicle', vehicleSchema);
export const BookingModel = model<IBooking>('Booking', bookingSchema);

// Session store
import session from 'express-session';
import memoryStore from 'memorystore';

// Create a memory store for development
const MemoryStore = memoryStore(session);

export const sessionStore = new MemoryStore({
  checkPeriod: 1000 * 60 * 60 * 24 // 1 day
});