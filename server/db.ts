import mongoose from 'mongoose';
import session from 'express-session';
import memoryStore from 'memorystore';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced TypeScript Interfaces
interface IUser extends mongoose.Document {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}

interface IVehicle extends mongoose.Document {
  name: string;
  type: string;
  pricePerDay: number;  // Changed from string to number
  description: string;
  imageUrl: string;
  available: boolean;
}

interface IBooking extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  includeDriver: boolean;
  totalPrice: number;  // Changed from string to number
  paymentIntentId: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

// Secure Connection Configuration
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://svinayak2004:Suryawanshi%402004@cluster0.lz7si.mongodb.net/car-rental?retryWrites=true&w=majority';

// Connection caching for serverless environments
let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable not configured');
  }

  const opts: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    ssl: true,
    sslValidate: false,
    authSource: 'admin',
    retryWrites: true,
    w: 'majority'
  };

  try {
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('🔐 MongoDB Connected with SSL');
        return mongoose;
      });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    cached.promise = null;
    throw error;
  }
}

// Enhanced Schemas with Validation
const userSchema = new mongoose.Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3
  },
  password: { 
    type: String, 
    required: true,
    select: false // Never return password in queries
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { 
    type: String, 
    default: null,
    match: [/^[0-9]{10}$/, 'Invalid phone number']
  }
});

const vehicleSchema = new mongoose.Schema<IVehicle>({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['sedan', 'suv', 'truck', 'hatchback', 'luxury']
  },
  pricePerDay: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative']
  },
  description: { type: String, required: true },
  imageUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: (url: string) => url.startsWith('http'),
      message: 'Image URL must be valid'
    }
  },
  available: { type: Boolean, default: true }
});

const bookingSchema = new mongoose.Schema<IBooking>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true,
    min: [Date.now, 'Start date cannot be in the past']
  },
  endDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(this: IBooking, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  includeDriver: { type: Boolean, default: false },
  totalPrice: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative']
  },
  paymentIntentId: { type: String, default: null },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'confirmed', 'cancelled']
  },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for better performance
userSchema.index({ email: 1 });
vehicleSchema.index({ type: 1, available: 1 });
bookingSchema.index({ userId: 1, status: 1 });

// Models
export const UserModel = mongoose.model<IUser>('User', userSchema);
export const VehicleModel = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
export const BookingModel = mongoose.model<IBooking>('Booking', bookingSchema);

// Session Store Configuration
const MemoryStore = memoryStore(session);
export const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // 1 day in ms
});