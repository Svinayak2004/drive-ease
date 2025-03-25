import mongoose from 'mongoose';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://svinayak2004:Suryawanshi%402004@cluster0.lz7si.mongodb.net/car-rental?retryWrites=true&w=majority';

// Connection caching for serverless environments
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('🚀 Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
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