import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inspection from '@/models/Inspection';
import { logAuditEvent } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Get current user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user details to check role and email
    const userDoc = await User.findById(user.userId).select('email role');
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const inspection = await Inspection.findById(params.id).lean();
    
    if (!inspection) {
      return NextResponse.json(
        { success: false, error: 'Inspection not found' },
        { status: 404 }
      );
    }
    
    // If user is not admin, check if they own this inspection
    if (userDoc.role !== 'admin') {
      if (inspection.inspectorEmail.toLowerCase() !== userDoc.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only view your own inspections' },
          { status: 403 }
        );
      }
    }
    
    const response = NextResponse.json({ success: true, data: inspection });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can edit inspections' },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();
    
    const inspection = await Inspection.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!inspection) {
      return NextResponse.json(
        { success: false, error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Log audit event
    await logAuditEvent(request, {
      action: 'inspection.updated',
      resourceType: 'inspection',
      resourceId: inspection._id.toString(),
      details: {
        inspectionNumber: inspection.inspectionNumber,
      },
    });
    
    return NextResponse.json({ success: true, data: inspection });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const inspection = await Inspection.findById(params.id);
    
    if (!inspection) {
      return NextResponse.json(
        { success: false, error: 'Inspection not found' },
        { status: 404 }
      );
    }
    
    // Log audit event before deletion
    await logAuditEvent(request, {
      action: 'inspection.deleted',
      resourceType: 'inspection',
      resourceId: inspection._id.toString(),
      details: {
        inspectionNumber: inspection.inspectionNumber,
        inspectorName: inspection.inspectorName,
      },
    });
    
    await Inspection.findByIdAndDelete(params.id);
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


