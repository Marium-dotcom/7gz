import { Schema, model, models } from 'mongoose';

export interface IHeroImage {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface IHeroBackground {
  type?: 'color' | 'image';
  color?: string;
  imageUrl?: string;
}

export interface IHero {
  title: string;
  subtitle?: string;
  description?: string;

  image?: IHeroImage;
  background?: IHeroBackground;

  ctaText?: string;
  ctaLink?: string;

  secondaryCtaText?: string;
  secondaryCtaLink?: string;

  isPublished: boolean;
  updatedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const ImageSchema = new Schema<IHeroImage>(
  {
    url: { type: String, trim: true },
    alt: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const BackgroundSchema = new Schema<IHeroBackground>(
  {
    type: { type: String, enum: ['color', 'image'], default: 'color' },
    color: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { _id: false }
);

const HeroSchema = new Schema<IHero>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    subtitle: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 600 },

    image: { type: ImageSchema, default: {} },
    background: { type: BackgroundSchema, default: {} },

    ctaText: { type: String, trim: true, maxlength: 60 },
    ctaLink: { type: String, trim: true },

    secondaryCtaText: { type: String, trim: true, maxlength: 60 },
    secondaryCtaLink: { type: String, trim: true },

    isPublished: { type: Boolean, default: false },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

const Hero = models.Hero || model<IHero>('Hero', HeroSchema);

export default Hero;
