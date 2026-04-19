import { Schema, Document, models, model } from 'mongoose';

export interface IService {
  title: string;
  description?: string;
  icon?: string;       // URL or icon name (e.g. lucide icon key)
  link?: string;
  order: number;
  isVisible: boolean;
}

export interface IServices extends Document {
  sectionTitle: string;
  sectionSubtitle?: string;
  sectionDescription?: string;
  isPublished: boolean;
  services: IService[];
}

const ServiceItemSchema = new Schema<IService>(
  {
    title:       { type: String, required: true },
    description: { type: String },
    icon:        { type: String },
    link:        { type: String },
    order:       { type: Number, default: 0 },
    isVisible:   { type: Boolean, default: true },
  },
  { _id: true }
);

const ServicesSchema = new Schema<IServices>(
  {
    sectionTitle:       { type: String, required: true },
    sectionSubtitle:    { type: String },
    sectionDescription: { type: String },
    isPublished:        { type: Boolean, default: false },
    services:           { type: [ServiceItemSchema], default: [] },
  },
  { timestamps: true }
);

const Services = models.Services || model<IServices>('Services', ServicesSchema);
export default Services;