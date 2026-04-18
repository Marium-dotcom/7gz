import { Schema, model, models } from 'mongoose';

export interface IHeroTypography {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  letterSpacing?: string;
  lineHeight?: string;
}

export interface IHeroImage {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface IHeroBackground {
  type?: 'color' | 'image' | 'gradient';
  color?: string;
  imageUrl?: string;
  gradient?: string;
  opacity?: number;
}

export interface IHero {
  title: string;
  subtitle?: string;
  description?: string;

  titleStyle?: IHeroTypography;
  subtitleStyle?: IHeroTypography;
  descriptionStyle?: IHeroTypography;

  image?: IHeroImage;
  background?: IHeroBackground;

  ctaText?: string;
  ctaLink?: string;
  ctaColor?: string;
  ctaTextColor?: string;

  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  secondaryCtaColor?: string;
  secondaryCtaTextColor?: string;

  isPublished: boolean;
  updatedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const TypographySchema = new Schema<IHeroTypography>(
  {
    fontFamily: { type: String, trim: true },
    fontSize: { type: String, trim: true },
    fontWeight: { type: String, trim: true },
    color: { type: String, trim: true },
    letterSpacing: { type: String, trim: true },
    lineHeight: { type: String, trim: true },
  },
  { _id: false }
);

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
    type: {
      type: String,
      enum: ['color', 'image', 'gradient'],
      default: 'color',
    },
    color: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    gradient: { type: String, trim: true },
    opacity: { type: Number, min: 0, max: 1, default: 1 },
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

    titleStyle: { type: TypographySchema, default: {} },
    subtitleStyle: { type: TypographySchema, default: {} },
    descriptionStyle: { type: TypographySchema, default: {} },

    image: { type: ImageSchema, default: {} },
    background: { type: BackgroundSchema, default: {} },

    ctaText: { type: String, trim: true, maxlength: 60 },
    ctaLink: { type: String, trim: true },
    ctaColor: { type: String, trim: true },
    ctaTextColor: { type: String, trim: true },

    secondaryCtaText: { type: String, trim: true, maxlength: 60 },
    secondaryCtaLink: { type: String, trim: true },
    secondaryCtaColor: { type: String, trim: true },
    secondaryCtaTextColor: { type: String, trim: true },

    isPublished: { type: Boolean, default: false },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

const Hero = models.Hero || model<IHero>('Hero', HeroSchema);

export default Hero;