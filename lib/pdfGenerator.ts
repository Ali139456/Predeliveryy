import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IInspection } from '@/models/Inspection';
import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getCloudinaryUrl, hasCloudinaryConfig } from '@/lib/cloudinary';
import https from 'https';
import http from 'http';

// Helper function to load image as base64 from Cloudinary, S3, or local
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

// Helper to fetch image from URL
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

// Helper to get MIME type
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

// Helper to add image with proper aspect ratio
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
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(x, y, width, height);
    } catch (error) {
      console.warn(`Failed to add image to PDF: ${fileName || 'unknown'}`, error);
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

export async function generatePDF(inspection: IInspection): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // ============================================
  // HEADER - Professional Branded Header
  // ============================================
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 4, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Pre delivery inspection', margin, 22);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 220, 255);
  doc.text('Comprehensive Vehicle Inspection System', margin, 32);
  
  doc.setFontSize(9);
  const generatedText = `Generated: ${new Date().toLocaleString()}`;
  doc.text(generatedText, pageWidth - margin, 22, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  
  let yPos = 60;
  
  // ============================================
  // SECTION 1: Inspector Information (Table)
  // ============================================
  const inspectorData = [
    ['Inspection Number', inspection.inspectionNumber || 'N/A'],
    ['Inspector Name', inspection.inspectorName || 'N/A'],
    ['Email', inspection.inspectorEmail || 'N/A'],
    ['Inspection Date', new Date(inspection.inspectionDate).toLocaleDateString()],
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
      fontSize: 12,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // SECTION 2: Vehicle Information (Table)
  // ============================================
  if (inspection.vehicleInfo) {
    const vehicleInfo = inspection.vehicleInfo;
    const vehicleData: string[][] = [];
    
    if (vehicleInfo.dealer) vehicleData.push(['Dealer', vehicleInfo.dealer]);
    if (vehicleInfo.dealerStockNo) vehicleData.push(['Dealer Stock No', vehicleInfo.dealerStockNo]);
    if (vehicleInfo.make) vehicleData.push(['Make', vehicleInfo.make]);
    if (vehicleInfo.model) vehicleData.push(['Model', vehicleInfo.model]);
    if (vehicleInfo.year) vehicleData.push(['Year', vehicleInfo.year]);
    if (vehicleInfo.vin) vehicleData.push(['VIN', vehicleInfo.vin]);
    if (vehicleInfo.engine) vehicleData.push(['Engine', vehicleInfo.engine]);
    if (vehicleInfo.odometer) vehicleData.push(['Odometer', vehicleInfo.odometer]);
    if (vehicleInfo.complianceDate) vehicleData.push(['Compliance Date', vehicleInfo.complianceDate]);
    if (vehicleInfo.buildDate) vehicleData.push(['Build Date', vehicleInfo.buildDate]);
    if (vehicleInfo.licensePlate) vehicleData.push(['License Plate', vehicleInfo.licensePlate]);
    if (vehicleInfo.bookingNumber) vehicleData.push(['Booking Number', vehicleInfo.bookingNumber]);

    if (vehicleData.length > 0) {
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }

      autoTable(doc, {
        startY: yPos,
        head: [['Vehicle Information']],
        body: vehicleData,
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 12,
        },
        bodyStyles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
        },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // ============================================
  // SECTION 3: GPS Location (Table)
  // ============================================
  if (inspection.location) {
    const hasStart = inspection.location.start && 
                     inspection.location.start.latitude != null && 
                     inspection.location.start.longitude != null;
    const hasEnd = inspection.location.end && 
                   inspection.location.end.latitude != null && 
                   inspection.location.end.longitude != null;
    
    if (hasStart || hasEnd) {
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }

      const locationData: string[][] = [];
      
      if (hasStart && inspection.location.start) {
        const start = inspection.location.start;
        locationData.push(['Start Coordinates', `${start.latitude.toFixed(6)}, ${start.longitude.toFixed(6)}`]);
        if (start.address) locationData.push(['Start Address', start.address]);
        if (start.timestamp) locationData.push(['Start Time', new Date(start.timestamp).toLocaleString()]);
      }
      
      if (hasEnd && inspection.location.end) {
        const end = inspection.location.end;
        locationData.push(['End Coordinates', `${end.latitude.toFixed(6)}, ${end.longitude.toFixed(6)}`]);
        if (end.address) locationData.push(['End Address', end.address]);
        if (end.timestamp) locationData.push(['End Time', new Date(end.timestamp).toLocaleString()]);
      }

      autoTable(doc, {
        startY: yPos,
        head: [['GPS Location']],
        body: locationData,
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 12,
        },
        bodyStyles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
        },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // ============================================
  // SECTION 4: Barcode (Table)
  // ============================================
  if (inspection.barcode) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Barcode / QR Code']],
      body: [['Scanned Code', inspection.barcode]],
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============================================
  // SECTION 5: General Photos (Grid Layout)
  // ============================================
  if (inspection.photos && inspection.photos.length > 0) {
    if (yPos > pageHeight - 120) {
      doc.addPage();
      yPos = 20;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('General Photos', margin, yPos);
    yPos += 12;

    const photosPerRow = 2;
    const photoSpacing = 8;
    const photoWidth = (contentWidth - photoSpacing) / photosPerRow;
    const photoHeight = photoWidth * 0.75;

    let currentRowY = yPos;

    for (let i = 0; i < inspection.photos.length; i++) {
      const photo = inspection.photos[i];
      const fileName = typeof photo === 'string' ? photo : photo.fileName;
      
      const col = i % photosPerRow;
      const row = Math.floor(i / photosPerRow);

      if (row > 0 && col === 0) {
        if (currentRowY + photoHeight > pageHeight - 40) {
          doc.addPage();
          currentRowY = 20;
        } else {
          currentRowY = yPos + (row * (photoHeight + photoSpacing));
        }
      }

      const x = margin + (col * (photoWidth + photoSpacing));
      const y = currentRowY;

      const imageData = await loadImageAsBase64(fileName);
      await addImageToPDF(doc, imageData, x, y, photoWidth, photoHeight, fileName);

      if ((i + 1) % photosPerRow === 0 || i === inspection.photos.length - 1) {
        yPos = y + photoHeight + photoSpacing;
      }
    }

    yPos += 10;
  }

  // ============================================
  // SECTION 6: Inspection Checklist (Table Format)
  // ============================================
  const checklist = Array.isArray(inspection.checklist) ? inspection.checklist : [];

  for (const category of checklist) {
    if (!category || !category.category) continue;

    const items = Array.isArray(category.items) ? category.items : [];
    if (items.length === 0) continue;

    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }

    // Category header
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(margin, yPos - 6, contentWidth, 8, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(category.category, margin + 6, yPos);
    yPos += 12;

    // Prepare table data for this category
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
                        item.status === 'fail' ? '✗ FAIL' : 'N/A';

      const notes = item.notes && item.notes.trim() ? item.notes : '-';
      const photoCount = item.photos && item.photos.length > 0 ? `${item.photos.length} photo(s)` : 'No photos';

      tableData.push([
        item.item,
        statusText,
        notes,
        photoCount
      ]);
    }

    // Create table for category items
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Status', 'Notes', 'Photos']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [99, 102, 241],
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

    // Add item photos below each category
    for (const item of items) {
      if (!item.photos || item.photos.length === 0) continue;

      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }

      // Item name for photos section
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.item} - Photos:`, margin, yPos);
      yPos += 8;

      // Photos grid (3 per row)
      const itemPhotoWidth = (contentWidth - 10) / 3;
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

        const x = margin + 4 + (col * (itemPhotoWidth + photoSpacing));
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
  // SECTION 7: Signatures (Table)
  // ============================================
  if (yPos > pageHeight - 90) {
    doc.addPage();
    yPos = 20;
  }

  const signatureWidth = (contentWidth - 12) / 2;
  const signatureHeight = 30;
  const signatureSpacing = 12;

  // Technician Signature
  const techSigX = margin + 6;
  const techSigY = yPos + 20;

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
    }
  } else {
    doc.setFillColor(250, 250, 250);
    doc.rect(techSigX, techSigY, signatureWidth, signatureHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(techSigX, techSigY, signatureWidth, signatureHeight);
  }

  // Manager Signature
  const mgrSigX = margin + 6 + signatureWidth + signatureSpacing;
  const mgrSigY = yPos + 20;

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
    }
  } else {
    doc.setFillColor(250, 250, 250);
    doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight);
  }

  // Signature labels
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Technician Signature:', techSigX, yPos + 8);
  doc.text('Manager Signature:', mgrSigX, yPos + 8);

  // ============================================
  // FOOTER - Professional Footer on Every Page
  // ============================================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text('Pre delivery inspection', pageWidth - margin, pageHeight - 8, { align: 'right' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('© 2025 Pre delivery inspection - All Rights Reserved', margin, pageHeight - 8);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}
