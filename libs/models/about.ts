import { Schema, Document, models, model } from 'mongoose';

export interface IAboutStat {
  label: string;
  value: string;
  order: number;
  isVisible: boolean;
}

export interface IAboutImage {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface IAbout extends Document {
  sectionTitle: string;
  sectionSubtitle?: string;

  heading: string;
  subheading?: string;
  description?: string;
  secondaryDescription?: string;

  image?: IAboutImage;

  ctaText?: string;
  ctaLink?: string;

  stats: IAboutStat[];

  isPublished: boolean;
  updatedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const AboutImageSchema = new Schema<IAboutImage>(
  {
    url: { type: String, trim: true },
    alt: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const AboutStatSchema = new Schema<IAboutStat>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: true }
);

const AboutSchema = new Schema<IAbout>(
  {
    sectionTitle: { type: String, required: [true, 'Section title is required'], trim: true, maxlength: 120 },
    sectionSubtitle: { type: String, trim: true, maxlength: 200 },

    heading: { type: String, required: [true, 'Heading is required'], trim: true, maxlength: 150 },
    subheading: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    secondaryDescription: { type: String, trim: true, maxlength: 1000 },

    image: { type: AboutImageSchema, default: {} },

    ctaText: { type: String, trim: true, maxlength: 60 },
    ctaLink: { type: String, trim: true },

    stats: { type: [AboutStatSchema], default: [] },

    isPublished: { type: Boolean, default: false },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const About = models.About || model<IAbout>('About', AboutSchema);

export default About;
