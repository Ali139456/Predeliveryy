import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IInspection } from '@/models/Inspection';
import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getCloudinaryUrl, hasCloudinaryConfig } from '@/lib/cloudinary';
import https from 'https';
import http from 'http';

// Helper function to load image as base64
async function loadImageAsBase64(fileName: string): Promise<string | null> {
  try {
    // Try Cloudinary first
    if (hasCloudinaryConfig) {
      try {
        const cloudinaryUrl = getCloudinaryUrl(fileName);
        const imageBuffer = await fetchImageFromUrl(cloudinaryUrl);
        if (imageBuffer) {
          const ext = path.extname(fileName).toLowerCase();
          const mimeType = getMimeType(ext);
          return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        }
      } catch (error) {
        console.warn(`Failed to load image from Cloudinary: ${fileName}`, error);
      }
    }

    // Try S3
    const hasAWSCredentials = 
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_ACCESS_KEY_ID !== '' &&
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_SECRET_ACCESS_KEY !== '';

    if (hasAWSCredentials) {
      try {
        const s3Client = new S3Client({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });
        
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME || 'pre-delivery-inspections',
          Key: fileName,
        });
        
        const response = await s3Client.send(command);
        if (response.Body) {
          const chunks: Buffer[] = [];
          const stream = response.Body as any;
          
          if (stream instanceof Buffer) {
            const buffer = stream;
            const ext = path.extname(fileName).toLowerCase();
            const mimeType = getMimeType(ext);
            return `data:${mimeType};base64,${buffer.toString('base64')}`;
          } else {
            for await (const chunk of stream) {
              chunks.push(Buffer.from(chunk));
            }
            const buffer = Buffer.concat(chunks);
            const ext = path.extname(fileName).toLowerCase();
            const mimeType = getMimeType(ext);
            return `data:${mimeType};base64,${buffer.toString('base64')}`;
          }
        }
      } catch (error) {
        console.warn(`Failed to load image from S3: ${fileName}`, error);
      }
    }

    // Fallback to local storage
    const localPath = path.join(process.cwd(), 'public', 'uploads', fileName);
    if (fs.existsSync(localPath)) {
      const fileBuffer = fs.readFileSync(localPath);
      const ext = path.extname(fileName).toLowerCase();
      const mimeType = getMimeType(ext);
      return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to load image: ${fileName}`, error);
    return null;
  }
}

function fetchImageFromUrl(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

function getMimeType(ext: string): string {
  const mimeMap: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeMap[ext] || 'image/jpeg';
}

async function addImageToPDF(
  doc: jsPDF,
  imageData: string | null,
  x: number,
  y: number,
  width: number,
  height: number,
  fileName?: string
): Promise<void> {
  if (imageData) {
    try {
      doc.addImage(imageData, x, y, width, height);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.rect(x, y, width, height);
    } catch (error) {
      doc.setFillColor(245, 245, 245);
      doc.rect(x, y, width, height, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, y, width, height);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Image unavailable', x + width / 2, y + height / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(245, 245, 245);
    doc.rect(x, y, width, height, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(x, y, width, height);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Image unavailable', x + width / 2, y + height / 2, { align: 'center' });
  }
}

// Helper to format value (show "Not provided" if empty)
function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  return String(value);
}

// Helper to create a beautiful card section
function createCardSection(
  doc: jsPDF,
  title: string,
  yPos: number,
  margin: number,
  contentWidth: number,
  pageHeight: number
): { startY: number; endY: number } {
  const cardPadding = 8;
  const titleHeight = 10;
  
  // Check if we need a new page
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }
  
  // Card background
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3);
  
  // Title background
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos, contentWidth, titleHeight, 3, 3, 'F');
  
  // Title text
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin + cardPadding, yPos + 7);
  
  doc.setTextColor(0, 0, 0);
  
  return { startY: yPos + titleHeight + cardPadding, endY: yPos + 20 };
}

export async function generatePDF(inspection: IInspection): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // ============================================
  // MODERN HEADER DESIGN
  // ============================================
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 55, 'F');
  
  // Gradient effect
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 3, 'F');
  
  // Logo/Branding area
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Pre delivery inspection', margin, 28);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(240, 240, 255);
  doc.text('Comprehensive Vehicle Inspection Report', margin, 38);
  
  // Report info
  doc.setFontSize(10);
  doc.text(`Report #: ${inspection.inspectionNumber || 'N/A'}`, pageWidth - margin, 28, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 38, { align: 'right' });
  doc.text(`Status: ${inspection.status?.toUpperCase() || 'DRAFT'}`, pageWidth - margin, 48, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  
  let yPos = 68;
  
  // ============================================
  // SECTION 1: INSPECTOR INFORMATION
  // ============================================
  const inspectorCard = createCardSection(doc, 'Inspector Information', yPos, margin, contentWidth, pageHeight);
  let currentY = inspectorCard.startY;
  
  const inspectorFields = [
    { label: 'Inspector Name', value: formatValue(inspection.inspectorName) },
    { label: 'Email Address', value: formatValue(inspection.inspectorEmail) },
    { label: 'Inspection Date', value: formatValue(inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : null) },
    { label: 'Inspection Number', value: formatValue(inspection.inspectionNumber) },
  ];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  inspectorFields.forEach((field, index) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }
    
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 80);
    doc.text(`${field.label}:`, margin + 10, currentY);
    
    // Value
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const valueX = margin + 60;
    const valueWidth = contentWidth - 70;
    const lines = doc.splitTextToSize(field.value, valueWidth);
    doc.text(lines, valueX, currentY);
    
    currentY += Math.max(lines.length * 5, 8);
  });
  
  yPos = currentY + 15;
  
  // ============================================
  // SECTION 2: VEHICLE INFORMATION
  // ============================================
  const vehicleCard = createCardSection(doc, 'Vehicle Information', yPos, margin, contentWidth, pageHeight);
  currentY = vehicleCard.startY;
  
  const vehicleInfo = inspection.vehicleInfo || {};
  const vehicleFields = [
    { label: 'Dealer', value: formatValue(vehicleInfo.dealer) },
    { label: 'Dealer Stock No', value: formatValue(vehicleInfo.dealerStockNo) },
    { label: 'Make', value: formatValue(vehicleInfo.make) },
    { label: 'Model', value: formatValue(vehicleInfo.model) },
    { label: 'Year', value: formatValue(vehicleInfo.year) },
    { label: 'VIN', value: formatValue(vehicleInfo.vin) },
    { label: 'Engine', value: formatValue(vehicleInfo.engine) },
    { label: 'Odometer', value: formatValue(vehicleInfo.odometer) },
    { label: 'Compliance Date', value: formatValue(vehicleInfo.complianceDate) },
    { label: 'Build Date', value: formatValue(vehicleInfo.buildDate) },
    { label: 'License Plate', value: formatValue(vehicleInfo.licensePlate) },
    { label: 'Booking Number', value: formatValue(vehicleInfo.bookingNumber) },
  ];
  
  vehicleFields.forEach((field) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 80);
    doc.text(`${field.label}:`, margin + 10, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const valueX = margin + 60;
    const valueWidth = contentWidth - 70;
    const lines = doc.splitTextToSize(field.value, valueWidth);
    doc.text(lines, valueX, currentY);
    
    currentY += Math.max(lines.length * 5, 8);
  });
  
  yPos = currentY + 15;
  
  // ============================================
  // SECTION 3: GPS LOCATION
  // ============================================
  const location = inspection.location || {};
  const hasLocation = location.start || location.end || location.current || location.latitude;
  
  if (hasLocation) {
    const locationCard = createCardSection(doc, 'GPS Location', yPos, margin, contentWidth, pageHeight);
    currentY = locationCard.startY;
    
    // Start Location
    if (location.start) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(11);
      doc.text('Inspection Start Location', margin + 10, currentY);
      currentY += 8;
      
      const startFields = [
        { label: 'Latitude', value: formatValue(location.start.latitude) },
        { label: 'Longitude', value: formatValue(location.start.longitude) },
        { label: 'Address', value: formatValue(location.start.address) },
        { label: 'Timestamp', value: formatValue(location.start.timestamp ? new Date(location.start.timestamp).toLocaleString() : null) },
      ];
      
      startFields.forEach((field) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 80);
        doc.text(`${field.label}:`, margin + 15, currentY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(field.value, contentWidth - 80);
        doc.text(lines, margin + 65, currentY);
        currentY += Math.max(lines.length * 5, 7);
      });
      currentY += 5;
    }
    
    // End Location
    if (location.end) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(11);
      doc.text('Inspection End Location', margin + 10, currentY);
      currentY += 8;
      
      const endFields = [
        { label: 'Latitude', value: formatValue(location.end.latitude) },
        { label: 'Longitude', value: formatValue(location.end.longitude) },
        { label: 'Address', value: formatValue(location.end.address) },
        { label: 'Timestamp', value: formatValue(location.end.timestamp ? new Date(location.end.timestamp).toLocaleString() : null) },
      ];
      
      endFields.forEach((field) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 80);
        doc.text(`${field.label}:`, margin + 15, currentY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(field.value, contentWidth - 80);
        doc.text(lines, margin + 65, currentY);
        currentY += Math.max(lines.length * 5, 7);
      });
      currentY += 5;
    }
    
    // Current Location (legacy)
    if (location.latitude && location.longitude) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(11);
      doc.text('Current Location', margin + 10, currentY);
      currentY += 8;
      
      const currentFields = [
        { label: 'Latitude', value: formatValue(location.latitude) },
        { label: 'Longitude', value: formatValue(location.longitude) },
        { label: 'Address', value: formatValue(location.address) },
      ];
      
      currentFields.forEach((field) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 80);
        doc.text(`${field.label}:`, margin + 15, currentY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(field.value, contentWidth - 80);
        doc.text(lines, margin + 65, currentY);
        currentY += Math.max(lines.length * 5, 7);
      });
    }
    
    yPos = currentY + 15;
  } else {
    // Show empty location section
    const locationCard = createCardSection(doc, 'GPS Location', yPos, margin, contentWidth, pageHeight);
    currentY = locationCard.startY;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('No location data provided', margin + 10, currentY);
    yPos = currentY + 15;
  }
  
  // ============================================
  // SECTION 4: BARCODE/QR CODE
  // ============================================
  const barcodeCard = createCardSection(doc, 'Barcode / QR Code', yPos, margin, contentWidth, pageHeight);
  currentY = barcodeCard.startY;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 80);
  doc.text('Scanned Code:', margin + 10, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(formatValue(inspection.barcode), margin + 50, currentY);
  
  yPos = currentY + 15;
  
  // ============================================
  // SECTION 5: GENERAL PHOTOS
  // ============================================
  if (yPos > pageHeight - 120) {
    doc.addPage();
    yPos = 20;
  }
  
  const photosCard = createCardSection(doc, 'General Photos', yPos, margin, contentWidth, pageHeight);
  currentY = photosCard.startY;
  
  if (inspection.photos && inspection.photos.length > 0) {
    const photosPerRow = 2;
    const photoSpacing = 8;
    const photoWidth = (contentWidth - photoSpacing - 20) / photosPerRow;
    const photoHeight = photoWidth * 0.75;
    
    for (let i = 0; i < inspection.photos.length; i++) {
      const photo = inspection.photos[i];
      const fileName = typeof photo === 'string' ? photo : photo.fileName;
      
      const col = i % photosPerRow;
      const row = Math.floor(i / photosPerRow);
      
      if (row > 0 && col === 0) {
        if (currentY + photoHeight > pageHeight - 40) {
          doc.addPage();
          currentY = 20;
        } else {
          currentY = photosCard.startY + (row * (photoHeight + photoSpacing));
        }
      }
      
      const x = margin + 10 + (col * (photoWidth + photoSpacing));
      const y = currentY;
      
      const imageData = await loadImageAsBase64(fileName);
      await addImageToPDF(doc, imageData, x, y, photoWidth, photoHeight, fileName);
      
      if ((i + 1) % photosPerRow === 0 || i === inspection.photos.length - 1) {
        currentY = y + photoHeight + photoSpacing;
      }
    }
    
    yPos = currentY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('No general photos provided', margin + 10, currentY);
    yPos = currentY + 15;
  }
  
  // ============================================
  // SECTION 6: INSPECTION CHECKLIST
  // ============================================
  const checklist = Array.isArray(inspection.checklist) ? inspection.checklist : [];
  
  for (const category of checklist) {
    if (!category || !category.category) continue;
    
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }
    
    // Category header with beautiful styling
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, yPos - 5, contentWidth, 12, 3, 3, 'F');
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(category.category, margin + 8, yPos + 3);
    
    yPos += 12;
    
    const items = Array.isArray(category.items) ? category.items : [];
    
    if (items.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No items in this category', margin + 10, yPos);
      yPos += 10;
      continue;
    }
    
    // Create table for checklist items
    const tableData: any[][] = [];
    
    for (const item of items) {
      if (!item || !item.item) continue;
      
      const statusText = item.status === 'OK' ? '✓ OK' :
                        item.status === 'C' ? 'C' :
                        item.status === 'A' ? 'A' :
                        item.status === 'R' ? 'R' :
                        item.status === 'RP' ? 'RP' :
                        item.status === 'N' ? 'N/A' :
                        item.status === 'pass' ? '✓ PASS' :
                        item.status === 'fail' ? '✗ FAIL' : 
                        item.status === 'na' ? 'N/A' : formatValue(item.status);
      
      const notes = item.notes && item.notes.trim() ? item.notes : 'No notes';
      const photoCount = item.photos && item.photos.length > 0 ? `${item.photos.length} photo(s)` : 'No photos';
      
      tableData.push([
        item.item,
        statusText,
        notes,
        photoCount
      ]);
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Status', 'Notes', 'Photos']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 30, halign: 'center', fontSize: 8 },
      },
      margin: { left: margin, right: margin },
      styles: { overflow: 'linebreak', cellPadding: 3 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Add item photos
    for (const item of items) {
      if (!item.photos || item.photos.length === 0) continue;
      
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }
      
      // Item name for photos
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${item.item} - Photos:`, margin + 10, yPos);
      yPos += 8;
      
      // Photos grid
      const itemPhotoWidth = (contentWidth - 20) / 3;
      const itemPhotoHeight = itemPhotoWidth * 0.75;
      const photoSpacing = 5;
      
      for (let i = 0; i < item.photos.length; i++) {
        const photo = item.photos[i];
        const fileName = typeof photo === 'string' ? photo : photo.fileName;
        
        if (yPos + itemPhotoHeight > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        const col = i % 3;
        const row = Math.floor(i / 3);
        
        const x = margin + 10 + (col * (itemPhotoWidth + photoSpacing));
        const y = yPos + (row * (itemPhotoHeight + photoSpacing));
        
        const imageData = await loadImageAsBase64(fileName);
        await addImageToPDF(doc, imageData, x, y, itemPhotoWidth, itemPhotoHeight, fileName);
        
        if ((i + 1) % 3 === 0 || i === item.photos.length - 1) {
          yPos = y + itemPhotoHeight + photoSpacing;
        }
      }
      
      yPos += 8;
    }
    
    yPos += 5;
  }
  
  // ============================================
  // SECTION 7: SIGNATURES
  // ============================================
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }
  
  const signatureCard = createCardSection(doc, 'Signatures', yPos, margin, contentWidth, pageHeight);
  currentY = signatureCard.startY;
  
  const signatureWidth = (contentWidth - 30) / 2;
  const signatureHeight = 35;
  const signatureSpacing = 15;
  
  // Technician Signature
  const techSigX = margin + 10;
  const techSigY = currentY + 5;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 80);
  doc.text('Technician Signature:', techSigX, currentY);
  
  if (inspection.signatures?.technician) {
    try {
      doc.addImage(inspection.signatures.technician, 'PNG', techSigX, techSigY, signatureWidth, signatureHeight);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(techSigX, techSigY, signatureWidth, signatureHeight);
    } catch (e) {
      doc.setFillColor(250, 250, 250);
      doc.rect(techSigX, techSigY, signatureWidth, signatureHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(techSigX, techSigY, signatureWidth, signatureHeight);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Signature on file', techSigX + signatureWidth / 2, techSigY + signatureHeight / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(250, 250, 250);
    doc.rect(techSigX, techSigY, signatureWidth, signatureHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(techSigX, techSigY, signatureWidth, signatureHeight);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Not signed', techSigX + signatureWidth / 2, techSigY + signatureHeight / 2, { align: 'center' });
  }
  
  // Manager Signature
  const mgrSigX = margin + 10 + signatureWidth + signatureSpacing;
  const mgrSigY = currentY + 5;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 80);
  doc.text('Manager Signature:', mgrSigX, currentY);
  
  if (inspection.signatures?.manager) {
    try {
      doc.addImage(inspection.signatures.manager, 'PNG', mgrSigX, mgrSigY, signatureWidth, signatureHeight);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight);
    } catch (e) {
      doc.setFillColor(250, 250, 250);
      doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Signature on file', mgrSigX + signatureWidth / 2, mgrSigY + signatureHeight / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(250, 250, 250);
    doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Not signed', mgrSigX + signatureWidth / 2, mgrSigY + signatureHeight / 2, { align: 'center' });
  }
  
  // ============================================
  // SECTION 8: ADDITIONAL INFORMATION
  // ============================================
  yPos = mgrSigY + signatureHeight + 20;
  
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  const additionalCard = createCardSection(doc, 'Additional Information', yPos, margin, contentWidth, pageHeight);
  currentY = additionalCard.startY;
  
  const additionalFields = [
    { label: 'Privacy Consent', value: formatValue(inspection.privacyConsent) },
    { label: 'Data Retention Days', value: formatValue(inspection.dataRetentionDays) },
    { label: 'Created At', value: formatValue(inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : null) },
    { label: 'Updated At', value: formatValue(inspection.updatedAt ? new Date(inspection.updatedAt).toLocaleString() : null) },
  ];
  
  additionalFields.forEach((field) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 80);
    doc.text(`${field.label}:`, margin + 10, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(field.value, margin + 60, currentY);
    currentY += 8;
  });
  
  // ============================================
  // FOOTER - Professional Footer on Every Page
  // ============================================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text('Pre delivery inspection', pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('© 2025 Pre delivery inspection - All Rights Reserved', margin, pageHeight - 10);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}
