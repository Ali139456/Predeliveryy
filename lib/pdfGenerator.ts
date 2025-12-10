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
      // Professional border with shadow effect
      doc.setDrawColor(180, 180, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, y, width, height);
      // Inner border for depth
      doc.setDrawColor(220, 220, 240);
      doc.setLineWidth(0.1);
      doc.rect(x + 1, y + 1, width - 2, height - 2);
    } catch (error) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, width, height, 2, 2, 'F');
      doc.setDrawColor(200, 200, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, width, height, 2, 2);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Image unavailable', x + width / 2, y + height / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, width, height, 2, 2, 'F');
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 2, 2);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Image unavailable', x + width / 2, y + height / 2, { align: 'center' });
  }
}

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

// Premium card section with modern design
function createPremiumCard(
  doc: jsPDF,
  title: string,
  yPos: number,
  margin: number,
  contentWidth: number,
  pageHeight: number
): { startY: number; endY: number } {
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }
  
  const titleHeight = 12;
  const cardPadding = 10;
  
  // Card shadow effect (simulated with lighter background)
  doc.setFillColor(252, 252, 255);
  doc.roundedRect(margin - 1, yPos - 1, contentWidth + 2, 25, 4, 4, 'F');
  
  // Main card background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, yPos, contentWidth, 23, 4, 4, 'F');
  
  // Elegant gradient header
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos, contentWidth, titleHeight, 4, 4, 'F');
  
  // Accent line
  doc.setFillColor(139, 92, 246);
  doc.rect(margin, yPos, contentWidth, 2, 'F');
  
  // Title with icon space
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin + cardPadding, yPos + 8);
  
  // Subtle border
  doc.setDrawColor(220, 220, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 23, 4, 4);
  
  doc.setTextColor(0, 0, 0);
  
  return { startY: yPos + titleHeight + 6, endY: yPos + 23 };
}

// Create elegant two-column info display
function addInfoRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth: number,
  valueWidth: number,
  fontSize: number = 10
): number {
  // Label with background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y - 5, labelWidth, 7, 1, 1, 'F');
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(`${label}:`, x + 3, y);
  
  // Value
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 40);
  const lines = doc.splitTextToSize(value, valueWidth);
  doc.text(lines, x + labelWidth + 5, y);
  
  return y + Math.max(lines.length * (fontSize * 0.4), 8);
}

export async function generatePDF(inspection: IInspection): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - (margin * 2);
  
  // ============================================
  // PREMIUM HEADER DESIGN
  // ============================================
  // Main header background with gradient effect
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Gradient accent bars
  doc.setFillColor(139, 92, 246);
  doc.rect(0, 0, pageWidth, 4, 'F');
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 4, pageWidth, 2, 'F');
  
  // Decorative line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(0, 58, pageWidth, 58);
  
  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Pre delivery inspection', margin, 32);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(240, 240, 255);
  doc.text('Professional Vehicle Inspection Report', margin, 42);
  
  // Report metadata box
  const metaBoxWidth = 80;
  const metaBoxX = pageWidth - margin - metaBoxWidth;
  // Use a semi-transparent effect with lighter color
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(metaBoxX, 20, metaBoxWidth, 35, 3, 3, 'F');
  
  // Border for the box
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(metaBoxX, 20, metaBoxWidth, 35, 3, 3);
  
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT DETAILS', metaBoxX + 5, 28);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`#${inspection.inspectionNumber || 'N/A'}`, metaBoxX + 5, 35);
  doc.text(`Status: ${inspection.status?.toUpperCase() || 'DRAFT'}`, metaBoxX + 5, 42);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, metaBoxX + 5, 49);
  
  doc.setTextColor(0, 0, 0);
  
  let yPos = 72;
  
  // ============================================
  // SECTION 1: INSPECTOR INFORMATION (Premium Table)
  // ============================================
  const inspectorData = [
    ['Inspector Name', formatValue(inspection.inspectorName)],
    ['Email Address', formatValue(inspection.inspectorEmail)],
    ['Inspection Date', formatValue(inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : null)],
    ['Inspection Number', formatValue(inspection.inspectionNumber)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Inspector Information']],
    body: inspectorData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 13,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: [79, 70, 229] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellPadding: 4 },
    didDrawPage: (data) => {
      // Add subtle border
      doc.setDrawColor(220, 220, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos - 5, contentWidth, data.cursor.y - yPos + 10, 3, 3);
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 18;

  // ============================================
  // SECTION 2: VEHICLE INFORMATION (Premium Table)
  // ============================================
  const vehicleInfo = inspection.vehicleInfo || {};
  const vehicleData: string[][] = [];
  
  if (vehicleInfo.dealer) vehicleData.push(['Dealer', formatValue(vehicleInfo.dealer)]);
  if (vehicleInfo.dealerStockNo) vehicleData.push(['Dealer Stock No', formatValue(vehicleInfo.dealerStockNo)]);
  if (vehicleInfo.make) vehicleData.push(['Make', formatValue(vehicleInfo.make)]);
  if (vehicleInfo.model) vehicleData.push(['Model', formatValue(vehicleInfo.model)]);
  if (vehicleInfo.year) vehicleData.push(['Year', formatValue(vehicleInfo.year)]);
  if (vehicleInfo.vin) vehicleData.push(['VIN', formatValue(vehicleInfo.vin)]);
  if (vehicleInfo.engine) vehicleData.push(['Engine', formatValue(vehicleInfo.engine)]);
  if (vehicleInfo.odometer) vehicleData.push(['Odometer', formatValue(vehicleInfo.odometer)]);
  if (vehicleInfo.complianceDate) vehicleData.push(['Compliance Date', formatValue(vehicleInfo.complianceDate)]);
  if (vehicleInfo.buildDate) vehicleData.push(['Build Date', formatValue(vehicleInfo.buildDate)]);
  if (vehicleInfo.licensePlate) vehicleData.push(['License Plate', formatValue(vehicleInfo.licensePlate)]);
  if (vehicleInfo.bookingNumber) vehicleData.push(['Booking Number', formatValue(vehicleInfo.bookingNumber)]);

  // Add all fields even if empty
  const allVehicleFields = [
    ['Dealer', formatValue(vehicleInfo.dealer)],
    ['Dealer Stock No', formatValue(vehicleInfo.dealerStockNo)],
    ['Make', formatValue(vehicleInfo.make)],
    ['Model', formatValue(vehicleInfo.model)],
    ['Year', formatValue(vehicleInfo.year)],
    ['VIN', formatValue(vehicleInfo.vin)],
    ['Engine', formatValue(vehicleInfo.engine)],
    ['Odometer', formatValue(vehicleInfo.odometer)],
    ['Compliance Date', formatValue(vehicleInfo.complianceDate)],
    ['Build Date', formatValue(vehicleInfo.buildDate)],
    ['License Plate', formatValue(vehicleInfo.licensePlate)],
    ['Booking Number', formatValue(vehicleInfo.bookingNumber)],
  ];

  if (allVehicleFields.length > 0) {
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Vehicle Information']],
      body: allVehicleFields,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 13,
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: [79, 70, 229] },
        1: { cellWidth: 'auto', textColor: [30, 30, 40] },
      },
      margin: { left: margin, right: margin },
      styles: { overflow: 'linebreak', cellPadding: 4 },
      didDrawPage: (data) => {
        doc.setDrawColor(220, 220, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPos - 5, contentWidth, data.cursor.y - yPos + 10, 3, 3);
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 18;
  }

  // ============================================
  // SECTION 3: GPS LOCATION (Premium Table)
  // ============================================
  const location = inspection.location || {};
  const hasLocation = location.start || location.end || location.current || location.latitude;
  
  if (hasLocation) {
    const locationData: string[][] = [];
    
    if (location.start) {
      locationData.push(['Start Latitude', formatValue(location.start.latitude)]);
      locationData.push(['Start Longitude', formatValue(location.start.longitude)]);
      if (location.start.address) locationData.push(['Start Address', formatValue(location.start.address)]);
      if (location.start.timestamp) locationData.push(['Start Time', formatValue(new Date(location.start.timestamp).toLocaleString())]);
    }
    
    if (location.end) {
      locationData.push(['End Latitude', formatValue(location.end.latitude)]);
      locationData.push(['End Longitude', formatValue(location.end.longitude)]);
      if (location.end.address) locationData.push(['End Address', formatValue(location.end.address)]);
      if (location.end.timestamp) locationData.push(['End Time', formatValue(new Date(location.end.timestamp).toLocaleString())]);
    }
    
    if (location.latitude && location.longitude) {
      locationData.push(['Current Latitude', formatValue(location.latitude)]);
      locationData.push(['Current Longitude', formatValue(location.longitude)]);
      if (location.address) locationData.push(['Current Address', formatValue(location.address)]);
    }

    // Add all location fields even if empty
    const allLocationFields = [
      ['Start Latitude', formatValue(location.start?.latitude)],
      ['Start Longitude', formatValue(location.start?.longitude)],
      ['Start Address', formatValue(location.start?.address)],
      ['Start Time', formatValue(location.start?.timestamp ? new Date(location.start.timestamp).toLocaleString() : null)],
      ['End Latitude', formatValue(location.end?.latitude)],
      ['End Longitude', formatValue(location.end?.longitude)],
      ['End Address', formatValue(location.end?.address)],
      ['End Time', formatValue(location.end?.timestamp ? new Date(location.end.timestamp).toLocaleString() : null)],
      ['Current Latitude', formatValue(location.latitude)],
      ['Current Longitude', formatValue(location.longitude)],
      ['Current Address', formatValue(location.address)],
    ];

    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }

    autoTable(doc, {
      startY: yPos,
      head: [['GPS Location']],
      body: allLocationFields,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 13,
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: [79, 70, 229] },
        1: { cellWidth: 'auto', textColor: [30, 30, 40] },
      },
      margin: { left: margin, right: margin },
      styles: { overflow: 'linebreak', cellPadding: 4 },
      didDrawPage: (data) => {
        doc.setDrawColor(220, 220, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPos - 5, contentWidth, data.cursor.y - yPos + 10, 3, 3);
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 18;
  } else {
    // Show empty location section
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    autoTable(doc, {
      startY: yPos,
      head: [['GPS Location']],
      body: [['Location Data', 'Not provided']],
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 13,
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [150, 150, 150],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 18;
  }

  // ============================================
  // SECTION 4: BARCODE/QR CODE (Premium Table)
  // ============================================
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Barcode / QR Code']],
    body: [['Scanned Code', formatValue(inspection.barcode)]],
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 13,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: [79, 70, 229] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 18;

  // ============================================
  // SECTION 5: GENERAL PHOTOS (Premium Grid)
  // ============================================
  if (yPos > pageHeight - 130) {
    doc.addPage();
    yPos = 20;
  }

  // Premium section header
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 3, 3, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('General Photos', margin + 6, yPos + 2);
  yPos += 12;

  if (inspection.photos && inspection.photos.length > 0) {
    const photosPerRow = 2;
    const photoSpacing = 10;
    const photoWidth = (contentWidth - photoSpacing) / photosPerRow;
    const photoHeight = photoWidth * 0.75;
    
    for (let i = 0; i < inspection.photos.length; i++) {
      const photo = inspection.photos[i];
      const fileName = typeof photo === 'string' ? photo : photo.fileName;
      
      const col = i % photosPerRow;
      const row = Math.floor(i / photosPerRow);
      
      if (row > 0 && col === 0) {
        if (yPos + photoHeight > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos = yPos + (row * (photoHeight + photoSpacing));
        }
      }
      
      const x = margin + (col * (photoWidth + photoSpacing));
      const y = yPos;
      
      const imageData = await loadImageAsBase64(fileName);
      await addImageToPDF(doc, imageData, x, y, photoWidth, photoHeight, fileName);
      
      // Photo number label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`Photo ${i + 1}`, x + photoWidth / 2, y + photoHeight + 5, { align: 'center' });
      
      if ((i + 1) % photosPerRow === 0 || i === inspection.photos.length - 1) {
        yPos = y + photoHeight + 15;
      }
    }
    
    yPos += 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('No general photos provided', margin + 6, yPos);
    yPos += 15;
  }

  // ============================================
  // SECTION 6: INSPECTION CHECKLIST (Premium Design)
  // ============================================
  const checklist = Array.isArray(inspection.checklist) ? inspection.checklist : [];
  
  for (const category of checklist) {
    if (!category || !category.category) continue;
    
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }
    
    // Premium category header
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, yPos - 6, contentWidth, 14, 4, 4, 'F');
    
    // Accent line
    doc.setFillColor(139, 92, 246);
    doc.rect(margin, yPos - 6, contentWidth, 2, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(category.category, margin + 8, yPos + 4);
    
    yPos += 12;
    
    const items = Array.isArray(category.items) ? category.items : [];
    
    if (items.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No items in this category', margin + 6, yPos);
      yPos += 10;
      continue;
    }
    
    // Premium table for checklist items
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
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 75, fontStyle: 'bold', textColor: [30, 30, 40] },
        1: { cellWidth: 28, halign: 'center', fontStyle: 'bold', textColor: [79, 70, 229] },
        2: { cellWidth: 'auto', textColor: [60, 60, 80] },
        3: { cellWidth: 35, halign: 'center', fontSize: 8, textColor: [100, 100, 120] },
      },
      margin: { left: margin, right: margin },
      styles: { overflow: 'linebreak', cellPadding: 3 },
      alternateRowStyles: {
        fillColor: [252, 252, 255],
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 12;
    
    // Add item photos with premium styling
    for (const item of items) {
      if (!item.photos || item.photos.length === 0) continue;
      
      if (yPos > pageHeight - 90) {
        doc.addPage();
        yPos = 20;
      }
      
      // Item photo section header
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos - 3, contentWidth, 8, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${item.item} - Photos:`, margin + 6, yPos + 2);
      yPos += 10;
      
      // Photos grid (3 per row)
      const itemPhotoWidth = (contentWidth - 12) / 3;
      const itemPhotoHeight = itemPhotoWidth * 0.75;
      const photoSpacing = 6;
      
      for (let i = 0; i < item.photos.length; i++) {
        const photo = item.photos[i];
        const fileName = typeof photo === 'string' ? photo : photo.fileName;
        
        if (yPos + itemPhotoHeight > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }
        
        const col = i % 3;
        const row = Math.floor(i / 3);
        
        const x = margin + 6 + (col * (itemPhotoWidth + photoSpacing));
        const y = yPos + (row * (itemPhotoHeight + photoSpacing));
        
        const imageData = await loadImageAsBase64(fileName);
        await addImageToPDF(doc, imageData, x, y, itemPhotoWidth, itemPhotoHeight, fileName);
        
        // Photo label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(`${i + 1}`, x + itemPhotoWidth / 2, y + itemPhotoHeight + 4, { align: 'center' });
        
        if ((i + 1) % 3 === 0 || i === item.photos.length - 1) {
          yPos = y + itemPhotoHeight + 10;
        }
      }
      
      yPos += 8;
    }
    
    yPos += 8;
  }

  // ============================================
  // SECTION 7: SIGNATURES (Premium Design)
  // ============================================
  if (yPos > pageHeight - 110) {
    doc.addPage();
    yPos = 20;
  }

  // Premium signature section header
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 3, 3, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Signatures', margin + 6, yPos + 2);
  yPos += 12;

  const signatureWidth = (contentWidth - 20) / 2;
  const signatureHeight = 38;
  const signatureSpacing = 20;

  // Technician Signature
  const techSigX = margin + 10;
  const techSigY = yPos + 5;

  // Signature box with premium styling
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(techSigX, techSigY, signatureWidth, signatureHeight + 15, 3, 3, 'F');
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.5);
  doc.roundedRect(techSigX, techSigY, signatureWidth, signatureHeight + 15, 3, 3);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Technician Signature', techSigX + signatureWidth / 2, techSigY + 6, { align: 'center' });

  if (inspection.signatures?.technician) {
    try {
      doc.addImage(inspection.signatures.technician, 'PNG', techSigX + 5, techSigY + 10, signatureWidth - 10, signatureHeight);
      doc.setDrawColor(180, 180, 200);
      doc.setLineWidth(0.3);
      doc.rect(techSigX + 5, techSigY + 10, signatureWidth - 10, signatureHeight);
    } catch (e) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(techSigX + 5, techSigY + 10, signatureWidth - 10, signatureHeight, 2, 2, 'F');
      doc.setDrawColor(200, 200, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(techSigX + 5, techSigY + 10, signatureWidth - 10, signatureHeight, 2, 2);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Signature on file', techSigX + signatureWidth / 2, techSigY + 10 + signatureHeight / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(techSigX + 5, techSigY + 10, signatureWidth - 10, signatureHeight, 2, 2, 'F');
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(techSigX + 5, techSigY + 10, signatureWidth - 10, signatureHeight, 2, 2);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Not signed', techSigX + signatureWidth / 2, techSigY + 10 + signatureHeight / 2, { align: 'center' });
  }

  // Manager Signature
  const mgrSigX = margin + 10 + signatureWidth + signatureSpacing;
  const mgrSigY = yPos + 5;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(mgrSigX, mgrSigY, signatureWidth, signatureHeight + 15, 3, 3, 'F');
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.5);
  doc.roundedRect(mgrSigX, mgrSigY, signatureWidth, signatureHeight + 15, 3, 3);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Manager Signature', mgrSigX + signatureWidth / 2, mgrSigY + 6, { align: 'center' });

  if (inspection.signatures?.manager) {
    try {
      doc.addImage(inspection.signatures.manager, 'PNG', mgrSigX + 5, mgrSigY + 10, signatureWidth - 10, signatureHeight);
      doc.setDrawColor(180, 180, 200);
      doc.setLineWidth(0.3);
      doc.rect(mgrSigX + 5, mgrSigY + 10, signatureWidth - 10, signatureHeight);
    } catch (e) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(mgrSigX + 5, mgrSigY + 10, signatureWidth - 10, signatureHeight, 2, 2, 'F');
      doc.setDrawColor(200, 200, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(mgrSigX + 5, mgrSigY + 10, signatureWidth - 10, signatureHeight, 2, 2);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Signature on file', mgrSigX + signatureWidth / 2, mgrSigY + 10 + signatureHeight / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(mgrSigX + 5, mgrSigY + 10, signatureWidth - 10, signatureHeight, 2, 2, 'F');
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(mgrSigX + 5, mgrSigY + 10, signatureWidth - 10, signatureHeight, 2, 2);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Not signed', mgrSigX + signatureWidth / 2, mgrSigY + 10 + signatureHeight / 2, { align: 'center' });
  }

  // ============================================
  // SECTION 8: ADDITIONAL INFORMATION (Premium Table)
  // ============================================
  yPos = mgrSigY + signatureHeight + 25;

  if (yPos > pageHeight - 70) {
    doc.addPage();
    yPos = 20;
  }

  const additionalFields = [
    ['Privacy Consent', formatValue(inspection.privacyConsent)],
    ['Data Retention Days', formatValue(inspection.dataRetentionDays)],
    ['Created At', formatValue(inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : null)],
    ['Updated At', formatValue(inspection.updatedAt ? new Date(inspection.updatedAt).toLocaleString() : null)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Additional Information']],
    body: additionalFields,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 13,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: [79, 70, 229] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellPadding: 4 },
  });

  // ============================================
  // PREMIUM FOOTER - On Every Page
  // ============================================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    // Top border
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Page number
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    
    // Branding
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text('Pre delivery inspection', pageWidth - margin, pageHeight - 12, { align: 'right' });
    
    // Copyright
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text('© 2025 Pre delivery inspection - All Rights Reserved', margin, pageHeight - 12);
    
    // Generation info
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 140);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}
