import mongoose, { Schema, Document } from 'mongoose';

export interface IInspection extends Document {
  inspectionNumber: string;
  inspectorName: string;
  inspectorEmail: string;
  inspectionDate: Date;
  location: {
    start?: {
      latitude: number;
      longitude: number;
      address?: string;
      timestamp: Date;
    };
    end?: {
      latitude: number;
      longitude: number;
      address?: string;
      timestamp: Date;
    };
    current?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    roadTest?: {
      distance?: number; // in kilometers
      duration?: number; // in minutes
      route?: Array<{ latitude: number; longitude: number; timestamp: Date }>;
    };
    // Legacy support for backward compatibility
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  barcode?: string;
  vehicleInfo?: {
    dealer?: string;
    dealerStockNo?: string;
    make?: string;
    model?: string;
    year?: string;
    vin?: string;
    engine?: string;
    odometer?: string;
    complianceDate?: string;
    buildDate?: string;
    licensePlate?: string;
    bookingNumber?: string;
  };
  checklist: {
    category: string;
    items: {
      item: string;
      status: 'OK' | 'C' | 'A' | 'R' | 'RP' | 'N' | 'pass' | 'fail' | 'na';
      notes?: string;
      photos?: {
        fileName: string;
        metadata?: {
          width?: number;
          height?: number;
          make?: string;
          model?: string;
          dateTime?: string;
          latitude?: number;
          longitude?: number;
          [key: string]: any;
        };
      }[];
    }[];
  }[];
  photos: {
    fileName: string;
    metadata?: {
      width?: number;
      height?: number;
      make?: string;
      model?: string;
      dateTime?: string;
      latitude?: number;
      longitude?: number;
      [key: string]: any;
    };
  }[];
  status: 'draft' | 'completed';
  signatures?: {
    technician?: string;
    manager?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  privacyConsent: boolean;
  dataRetentionDays?: number;
}

const InspectionSchema: Schema = new Schema(
  {
    inspectionNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    inspectorName: {
      type: String,
      required: true,
    },
    inspectorEmail: {
      type: String,
      required: true,
      index: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
      index: true,
    },
    location: {
      start: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
        timestamp: { type: Date },
      },
      end: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
        timestamp: { type: Date },
      },
      current: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
      },
      roadTest: {
        distance: { type: Number },
        duration: { type: Number },
        route: [{
          latitude: { type: Number },
          longitude: { type: Number },
          timestamp: { type: Date },
        }],
      },
      // Legacy support
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
    barcode: {
      type: String,
      index: true,
    },
    vehicleInfo: {
      dealer: String,
      dealerStockNo: String,
      make: String,
      model: String,
      year: String,
      vin: { type: String, index: true },
      engine: String,
      odometer: String,
      complianceDate: String,
      buildDate: String,
      licensePlate: { type: String, index: true },
      bookingNumber: { type: String, index: true },
    },
    checklist: [
      {
        category: { type: String, required: true },
        items: [
          {
            item: { type: String, required: true },
            status: {
              type: String,
              enum: ['OK', 'C', 'A', 'R', 'RP', 'N', 'pass', 'fail', 'na'],
              required: true,
            },
            notes: String,
            photos: [{
              fileName: { type: String, required: true },
              metadata: {
                width: { type: Number },
                height: { type: Number },
                make: { type: String },
                model: { type: String },
                dateTime: { type: String },
                latitude: { type: Number },
                longitude: { type: Number },
              },
            }],
          },
        ],
      },
    ],
    photos: [{
      fileName: { type: String, required: true },
      metadata: {
        width: { type: Number },
        height: { type: Number },
        make: { type: String },
        model: { type: String },
        dateTime: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
      },
    }],
    status: {
      type: String,
      enum: ['draft', 'completed'],
      default: 'draft',
      index: true,
    },
    signatures: {
      technician: { type: String },
      manager: { type: String },
    },
    privacyConsent: {
      type: Boolean,
      required: true,
    },
    dataRetentionDays: {
      type: Number,
      default: 365,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Inspection || mongoose.model<IInspection>('Inspection', InspectionSchema);


