import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inspection from '@/models/Inspection';
import { logAuditEvent } from '@/lib/audit';
import { uploadToS3 } from '@/lib/s3';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';

export async function POST(request: NextRequest) {
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
    const userDoc = await User.findById(user.userId).select('email role name');
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Ensure inspectorEmail matches the logged-in user's email (unless admin)
    if (userDoc.role !== 'admin') {
      body.inspectorEmail = userDoc.email.toLowerCase();
    } else if (body.inspectorEmail) {
      // Admin can set any email, but ensure it's lowercase
      body.inspectorEmail = body.inspectorEmail.toLowerCase();
    }
    
    // Auto-generate inspection number if not provided
    if (!body.inspectionNumber) {
      body.inspectionNumber = `INSP-${Date.now()}`;
    }
    
    const inspection = new Inspection(body);
    await inspection.save();
    
    // Log audit event
    await logAuditEvent(request, {
      action: 'inspection.created',
      resourceType: 'inspection',
      resourceId: inspection._id.toString(),
      details: {
        inspectionNumber: inspection.inspectionNumber,
        inspectorName: inspection.inspectorName,
        status: inspection.status,
      },
    });
    
    return NextResponse.json({ success: true, data: inspection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // If user is not admin, filter by their email
    if (userDoc.role !== 'admin') {
      query.inspectorEmail = userDoc.email.toLowerCase();
    }
    
    if (searchParams.get('search')) {
      const searchTerm = searchParams.get('search');
      query.$or = [
        { inspectionNumber: { $regex: searchTerm, $options: 'i' } },
        { inspectorName: { $regex: searchTerm, $options: 'i' } },
        { inspectorEmail: { $regex: searchTerm, $options: 'i' } },
        { barcode: { $regex: searchTerm, $options: 'i' } },
        { 'vehicleInfo.vin': { $regex: searchTerm, $options: 'i' } },
        { 'vehicleInfo.licensePlate': { $regex: searchTerm, $options: 'i' } },
        { 'vehicleInfo.bookingNumber': { $regex: searchTerm, $options: 'i' } },
      ];
    }
    
    if (searchParams.get('status')) {
      query.status = searchParams.get('status');
    }
    
    // Only allow filtering by inspectorEmail if user is admin
    if (searchParams.get('inspectorEmail') && userDoc.role === 'admin') {
      query.inspectorEmail = searchParams.get('inspectorEmail');
    }
    
    if (searchParams.get('startDate') && searchParams.get('endDate')) {
      query.inspectionDate = {
        $gte: new Date(searchParams.get('startDate')!),
        $lte: new Date(searchParams.get('endDate')!),
      };
    }
    
    const inspections = await Inspection.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(); // Use lean() for better performance
    
    // Add cache headers for GET requests
    const response = NextResponse.json({ success: true, data: inspections });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


