import { Schema, Document, models, model } from 'mongoose';

export interface IBooking extends Document {
  doctor:    Schema.Types.ObjectId;
  patient:   Schema.Types.ObjectId;
  dateStr:   string;   // "YYYY-MM-DD"
  startTime: string;   // "09:00"
  endTime:   string;   // "09:30"
  type:      'in-person' | 'online';
  status:    'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?:    string;
}

const BookingSchema = new Schema<IBooking>(
  {
    doctor:    { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient:   { type: Schema.Types.ObjectId, ref: 'User',   required: true },
    dateStr:   { type: String, required: true },
    startTime: { type: String, required: true },
    endTime:   { type: String, required: true },
    type:      { type: String, enum: ['in-person', 'online'], required: true },
    status:    { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
    notes:     { type: String },
  },
  { timestamps: true }
);

// Prevent double-booking the same slot
BookingSchema.index({ doctor: 1, dateStr: 1, startTime: 1 }, { unique: true });
BookingSchema.index({ patient: 1 });
BookingSchema.index({ doctor: 1, dateStr: 1 });

const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);
export default Booking;
