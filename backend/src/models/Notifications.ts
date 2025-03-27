// models/Notification.ts

import mongoose, { Schema, Document } from 'mongoose';

interface INotification extends Document {
  userId: mongoose.Types.ObjectId;       // This is the user who will receive the notification
  message: string;      // The notification message
  read: boolean;        // Whether the notification has been read
  createdAt: Date;      // When the notification was created
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export { Notification };
