import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  userEmail: string;
  userName: string;
  action: string; // e.g., 'inspection.created', 'user.updated', 'inspection.deleted'
  resourceType: string; // e.g., 'inspection', 'user', 'system'
  resourceId?: string;
  details: {
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

