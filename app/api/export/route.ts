import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inspection from '@/models/Inspection';
import { generatePDF } from '@/lib/pdfGenerator';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';

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
    const id = searchParams.get('id');
    
    if (id) {
      // Export single inspection
      const inspection = await Inspection.findById(id);
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
            { success: false, error: 'Forbidden: You can only export your own inspections' },
            { status: 403 }
          );
        }
      }
      
      try {
        const pdfBuffer = await generatePDF(inspection);
        
        // Ensure we have a valid buffer
        if (!pdfBuffer || pdfBuffer.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Failed to generate PDF - empty buffer' },
            { status: 500 }
          );
        }
        
        // Convert to Uint8Array for proper binary response
        const uint8Array = Buffer.isBuffer(pdfBuffer) 
          ? new Uint8Array(pdfBuffer) 
          : new Uint8Array(pdfBuffer);
        
        // Sanitize filename
        const sanitizedNumber = inspection.inspectionNumber.replace(/[^a-z0-9.-]/gi, '_');
        
        return new NextResponse(uint8Array, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Inspection-${sanitizedNumber}.pdf"`,
            'Content-Length': uint8Array.length.toString(),
          },
        });
      } catch (pdfError: any) {
        console.error('PDF generation error:', pdfError);
        return NextResponse.json(
          { success: false, error: `PDF generation failed: ${pdfError.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    }
    
    // Export multiple inspections
    const query: any = {};
    
    // If user is not admin, filter by their email
    if (userDoc.role !== 'admin') {
      query.inspectorEmail = userDoc.email.toLowerCase();
    }
    
    if (searchParams.get('startDate') && searchParams.get('endDate')) {
      query.inspectionDate = {
        $gte: new Date(searchParams.get('startDate')!),
        $lte: new Date(searchParams.get('endDate')!),
      };
    }
    
    const inspections = await Inspection.find(query).sort({ createdAt: -1 });
    
    // For multiple, return JSON (could be enhanced to create a combined PDF)
    return NextResponse.json({ success: true, data: inspections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


