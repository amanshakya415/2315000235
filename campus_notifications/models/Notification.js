import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    category: {
      type: String,
      enum: ['Exam', 'Placement', 'Event', 'General', 'Holiday'],
      default: 'General'
    },
    targetDepartment: {
      type: String,
      default: 'All'
    },
    createdBy: {
      type: String,
      required: [true, 'CreatedBy is required']
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ category: 1, targetDepartment: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
