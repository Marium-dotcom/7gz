import { Schema, model, models, Types } from 'mongoose';

export interface IMessage {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: 'user' | 'doctor';
  text: string;
  read: boolean;
  createdAt: Date;
}

export interface IConversation {
  userId: Types.ObjectId;
  doctorId: Types.ObjectId;
  messages: IMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ['user', 'doctor'], required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    messages: { type: [MessageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ConversationSchema.index({ userId: 1, doctorId: 1 }, { unique: true });
ConversationSchema.index({ lastMessageAt: -1 });

const Conversation = models.Conversation || model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
