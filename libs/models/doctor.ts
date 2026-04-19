import { Schema, Document, models, model } from 'mongoose';

// ── Sub-document interfaces ───────────────────────────────────────────────

export interface IAvailabilitySlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  from: string;   // "09:00"
  to:   string;   // "17:00"
  isAvailable: boolean;
}

export interface IEducation {
  degree:      string;
  institution: string;
  year:        number;
}

export interface IExperience {
  title:       string;
  workplace:   string;
  from:        number;   // year
  to?:         number;   // year — undefined means current
  isCurrent:   boolean;
}

export interface IReview {
  patient:   Schema.Types.ObjectId;
  rating:    number;   // 1–5
  comment?:  string;
  createdAt: Date;
}

// ── Main interface ────────────────────────────────────────────────────────

export interface IDoctor extends Document {
  user:        Schema.Types.ObjectId;   // ref: 'User'

  // Profile
  displayName: string;
  avatar?:     string;
  bio?:        string;
  gender?:     'male' | 'female' | 'other';
  languages:   string[];

  // Medical
  specialty:        string;
  subspecialties:   string[];
  licenseNumber:    string;
  yearsOfExperience: number;
  education:        IEducation[];
  experience:       IExperience[];

  // Practice
  clinicName?:       string;
  clinicAddress?:    string;
  city?:             string;
  country?:          string;
  phone?:            string;
  consultationFee:   number;
  currency:          string;

  // Availability
  availability:      IAvailabilitySlot[];
  appointmentDuration: number;   // minutes per appointment slot

  // Online
  offersOnlineConsultation: boolean;
  onlineFee?:               number;

  // Ratings
  rating:      number;
  reviewCount: number;
  reviews:     IReview[];

  // Status
  isVerified:  boolean;
  isActive:    boolean;
  isPublished: boolean;
}

// ── Sub-schemas ───────────────────────────────────────────────────────────

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    day:         {
      type: String,
      enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
      required: true,
    },
    from:        { type: String, required: true },
    to:          { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const EducationSchema = new Schema<IEducation>(
  {
    degree:      { type: String, required: true },
    institution: { type: String, required: true },
    year:        { type: Number, required: true },
  },
  { _id: false }
);

const ExperienceSchema = new Schema<IExperience>(
  {
    title:     { type: String, required: true },
    workplace: { type: String, required: true },
    from:      { type: Number, required: true },
    to:        { type: Number },
    isCurrent: { type: Boolean, default: false },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
  {
    patient:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating:    { type: Number, min: 1, max: 5, required: true },
    comment:   { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── Main schema ───────────────────────────────────────────────────────────

const DoctorSchema = new Schema<IDoctor>(
  {
    user: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },

    // Profile
    displayName: { type: String, required: true, trim: true },
    avatar:      { type: String },
    bio:         { type: String, trim: true },
    gender:      { type: String, enum: ['male', 'female', 'other'] },
    languages:   { type: [String], default: [] },

    // Medical
    specialty:         { type: String, required: true, index: true },
    subspecialties:    { type: [String], default: [] },
    licenseNumber:     { type: String, required: true, unique: true, trim: true },
    yearsOfExperience: { type: Number, default: 0 },
    education:         { type: [EducationSchema], default: [] },
    experience:        { type: [ExperienceSchema], default: [] },

    // Practice
    clinicName:      { type: String },
    clinicAddress:   { type: String },
    city:            { type: String, index: true },
    country:         { type: String },
    phone:           { type: String },
    consultationFee: { type: Number, required: true, default: 0 },
    currency:        { type: String, default: 'EGP' },

    // Availability
    availability:          { type: [AvailabilitySlotSchema], default: [] },
    appointmentDuration:   { type: Number, default: 30 },

    // Online
    offersOnlineConsultation: { type: Boolean, default: false },
    onlineFee:                { type: Number },

    // Ratings
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    reviews:     { type: [ReviewSchema], default: [] },

    // Status
    isVerified:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────

DoctorSchema.index({ specialty: 1, city: 1 });              // search by specialty + city
DoctorSchema.index({ isPublished: 1, isActive: 1 });        // public listing filter
DoctorSchema.index({ rating: -1 });                         // sort by top rated
DoctorSchema.index({ consultationFee: 1 });                 // sort / filter by fee
DoctorSchema.index({ offersOnlineConsultation: 1 });        // filter online doctors
DoctorSchema.index({ 'availability.day': 1 });              // filter by available day

// ── Pre-save: auto-update rating average ──────────────────────────────────

DoctorSchema.pre('save', async function () {
  if (this.isModified('reviews')) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.reviewCount = this.reviews.length;
    this.rating = this.reviewCount > 0
      ? Math.round((total / this.reviewCount) * 10) / 10
      : 0;
  }
});

const Doctor = models.Doctor || model<IDoctor>('Doctor', DoctorSchema);
export default Doctor;