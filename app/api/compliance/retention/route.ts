import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inspection from '@/models/Inspection';
import { shouldDeleteData } from '@/lib/compliance';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Find all inspections that should be deleted based on retention policy
    const inspections = await Inspection.find({ status: 'completed' });
    const toDelete: string[] = [];

    for (const inspection of inspections) {
      const retentionDays = inspection.dataRetentionDays || 365;
      if (shouldDeleteData(inspection.inspectionDate, retentionDays)) {
        toDelete.push(inspection._id.toString());
      }
    }

    if (toDelete.length > 0) {
      await Inspection.deleteMany({ _id: { $in: toDelete } });
    }

    return NextResponse.json({
      success: true,
      deletedCount: toDelete.length,
      message: `Deleted ${toDelete.length} inspections based on retention policy`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


