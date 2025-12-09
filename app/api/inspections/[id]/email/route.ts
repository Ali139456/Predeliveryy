import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inspection from '@/models/Inspection';
import { generatePDF } from '@/lib/pdfGenerator';
import { sendEmailWithPDF } from '@/lib/email';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';

export async function POST(
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
    
    const body = await request.json();
    const { recipients } = body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients are required' },
        { status: 400 }
      );
    }
    
    const inspection = await Inspection.findById(params.id);
    
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
          { success: false, error: 'Forbidden: You can only email your own inspections' },
          { status: 403 }
        );
      }
    }
    
    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDF(inspection);
    } catch (pdfError: any) {
      console.error('PDF generation error:', pdfError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to generate PDF: ${pdfError.message || 'Unknown error'}` 
        },
        { status: 500 }
      );
    }
    
    const pdfFileName = `Inspection-${inspection.inspectionNumber}-${Date.now()}.pdf`;
    
    const emailBody = `
      <h2>PreDelivery Report</h2>
      <p>Dear Recipient,</p>
      <p>Please find attached the pre-delivery inspection report for inspection number: <strong>${inspection.inspectionNumber}</strong></p>
      <p><strong>Inspector:</strong> ${inspection.inspectorName}</p>
      <p><strong>Date:</strong> ${new Date(inspection.inspectionDate).toLocaleDateString()}</p>
      <p>This is an automated email. Please do not reply.</p>
    `;
    
    // Send email
    try {
      await sendEmailWithPDF(
        recipients,
        `PreDelivery Report - ${inspection.inspectionNumber}`,
        emailBody,
        pdfBuffer,
        pdfFileName
      );
    } catch (emailError: any) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { 
          success: false, 
          error: emailError.message || 'Failed to send email. Please check your SMTP configuration.' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    );
  }
}


