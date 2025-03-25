import mongoose, { Schema, Document } from 'mongoose';
import { User, Vehicle, Booking } from '@shared/schema';

// User Model
export interface UserDocument extends Document, Omit<User, 'id'> {
  _id: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, default: null }
});

// Vehicle Model
export interface VehicleDocument extends Document, Omit<Vehicle, 'id'> {
  _id: mongoose.Types.ObjectId;
}

const VehicleSchema = new Schema<VehicleDocument>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  pricePerDay: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  available: { type: Boolean, required: true, default: true }
});

// Booking Model
export interface BookingDocument extends Document, Omit<Booking, 'id'> {
  _id: mongoose.Types.ObjectId;
}

const BookingSchema = new Schema<BookingDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  includeDriver: { type: Boolean, required: true, default: false },
  totalPrice: { type: String, required: true },
  paymentIntentId: { type: String, default: null },
  status: { type: String, required: true, default: 'pending' },
  createdAt: { type: Date, required: true, default: Date.now }
});

// Create and export models
export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
export const VehicleModel = mongoose.models.Vehicle || mongoose.model<VehicleDocument>('Vehicle', VehicleSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model<BookingDocument>('Booking', BookingSchema);