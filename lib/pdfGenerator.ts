import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IInspection } from '@/types/db';
import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getCloudinaryUrl, hasCloudinaryConfig } from '@/lib/cloudinary';
import { hasSupabaseStorageConfig, getSupabaseStoragePublicUrl } from '@/lib/supabase-storage';
import https from 'https';
import http from 'http';

// Helper function to load image as base64 (fileName can be a path or a full URL)
async function loadImageAsBase64(fileName: string): Promise<string | null> {
  try {
    // If it's already a full URL (e.g. Supabase public URL stored in photo.url), fetch directly
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
      const imageBuffer = await fetchImageFromUrl(fileName);
      if (imageBuffer) {
        const mimeMatch = fileName.match(/\.(jpe?g|png|gif|webp)/i);
        const mimeType = mimeMatch ? (mimeMatch[1] === 'jpg' || mimeMatch[1] === 'jpeg' ? 'image/jpeg' : `image/${mimeMatch[1]}`) : 'image/jpeg';
        return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      }
      return null;
    }

    if (hasSupabaseStorageConfig()) {
      try {
        const supabaseUrl = getSupabaseStoragePublicUrl(fileName);
        const imageBuffer = await fetchImageFromUrl(supabaseUrl);
        if (imageBuffer) {
          const ext = path.extname(fileName).toLowerCase();
          const mimeType = getMimeType(ext);
          return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        }
      } catch (e) {
        console.warn(`Failed to load image from Supabase Storage: ${fileName}`, e);
      }
    }

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

const IMAGE_FETCH_TIMEOUT_MS = 2500;
const MAX_GENERAL_PHOTOS = 12;
const MAX_PHOTOS_PER_CHECKLIST_ITEM = 3;
const IMAGE_LOAD_CONCURRENCY = 6;

function fetchImageFromUrl(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(null); // Don't hang PDF generation on slow images
    }, IMAGE_FETCH_TIMEOUT_MS);
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        clearTimeout(timeout);
        resolve(Buffer.concat(chunks));
      });
      res.on('error', () => {
        clearTimeout(timeout);
        resolve(null);
      });
    });
    req.on('error', () => {
      clearTimeout(timeout);
      resolve(null);
    });
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

/** Run promises in parallel with a concurrency limit */
async function runWithConcurrency<T>(items: T[], fn: (item: T) => Promise<string | null>, concurrency: number): Promise<Map<T, string | null>> {
  const results = new Map<T, string | null>();
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = index++;
      const item = items[current];
      try {
        const value = await fn(item);
        results.set(item, value);
      } catch {
        results.set(item, null);
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
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
      doc.setDrawColor(200, 200, 200);
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

export async function generatePDF(inspection: IInspection): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // ============================================
  // CLEAN HEADER
  // ============================================
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('Pre delivery inspection', margin, 28);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(240, 240, 255);
  doc.text('Comprehensive Vehicle Inspection Report', margin, 38);
  
  doc.setFontSize(9);
  doc.text(`Report #: ${inspection.inspectionNumber || 'N/A'}`, pageWidth - margin, 28, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 38, { align: 'right' });
  doc.text(`Status: ${inspection.status?.toUpperCase() || 'DRAFT'}`, pageWidth - margin, 48, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  
  let yPos = 60;

  // Pre-load all images in parallel (capped) for fast PDF generation
  const imageSources: string[] = [];
  if (inspection.photos && inspection.photos.length > 0) {
    const general = inspection.photos.slice(0, MAX_GENERAL_PHOTOS);
    for (const photo of general) {
      const imageSrc = typeof photo === 'object' && photo?.url ? photo.url : (typeof photo === 'string' ? photo : (photo as any)?.fileName);
      if (imageSrc) imageSources.push(imageSrc);
    }
  }
  const checklist = Array.isArray(inspection.checklist) ? inspection.checklist : [];
  for (const category of checklist) {
    if (!category?.items) continue;
    for (const item of category.items) {
      if (!item.photos?.length) continue;
      const itemPhotos = item.photos.slice(0, MAX_PHOTOS_PER_CHECKLIST_ITEM);
      for (const photo of itemPhotos) {
        const imageSrc = typeof photo === 'object' && photo?.url ? photo.url : (typeof photo === 'string' ? photo : (photo as any)?.fileName);
        if (imageSrc) imageSources.push(imageSrc);
      }
    }
  }
  const uniqueSources = Array.from(new Set(imageSources));
  const imageCache = await runWithConcurrency(uniqueSources, (src) => loadImageAsBase64(src), IMAGE_LOAD_CONCURRENCY);
  
  // ============================================
  // SECTION 1: INSPECTOR INFORMATION (Table)
  // ============================================
  // Section title
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Inspector Information', margin + 6, yPos + 2);
  yPos += 12;

  const inspectorData = [
    ['Inspector Name', formatValue(inspection.inspectorName)],
    ['Email Address', formatValue(inspection.inspectorEmail)],
    ['Inspection Date', formatValue(inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : null)],
    ['Inspection Number', formatValue(inspection.inspectionNumber)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Field', 'Value']],
    body: inspectorData,
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    alternateRowStyles: {
      fillColor: [252, 252, 255],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // SECTION 2: VEHICLE INFORMATION (Table)
  // ============================================
  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }

  // Section title
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Vehicle Information', margin + 6, yPos + 2);
  yPos += 12;

  const vehicleInfo = inspection.vehicleInfo || {};
  const vehicleData = [
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

  autoTable(doc, {
    startY: yPos,
    head: [['Field', 'Value']],
    body: vehicleData,
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    alternateRowStyles: {
      fillColor: [252, 252, 255],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // SECTION 3: GPS LOCATION (Table)
  // ============================================
  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }

  // Section title
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GPS Location', margin + 6, yPos + 2);
  yPos += 12;

  const location = inspection.location || {};
  const locationData = [
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

  autoTable(doc, {
    startY: yPos,
    head: [['Field', 'Value']],
    body: locationData,
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    alternateRowStyles: {
      fillColor: [252, 252, 255],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // SECTION 4: BARCODE (Table)
  // ============================================
  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  // Section title
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Barcode / QR Code', margin + 6, yPos + 2);
  yPos += 12;

  autoTable(doc, {
    startY: yPos,
    head: [['Field', 'Value']],
    body: [['Scanned Code', formatValue(inspection.barcode)]],
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    alternateRowStyles: {
      fillColor: [252, 252, 255],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // SECTION 5: GENERAL PHOTOS
  // ============================================
  if (yPos > pageHeight - 120) {
    doc.addPage();
    yPos = 20;
  }

  // Section title
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('General Photos', margin + 6, yPos + 2);
  yPos += 12;

  if (inspection.photos && inspection.photos.length > 0) {
    const photosPerRow = 2;
    const photoSpacing = 8;
    const photoWidth = (contentWidth - photoSpacing) / photosPerRow;
    const photoHeight = photoWidth * 0.75;
    const generalPhotos = inspection.photos.slice(0, MAX_GENERAL_PHOTOS);
    
    for (let i = 0; i < generalPhotos.length; i++) {
      const photo = generalPhotos[i];
      const fileName = typeof photo === 'string' ? photo : (photo as any).fileName;
      const imageSrc = typeof photo === 'object' && (photo as any)?.url ? (photo as any).url : fileName;
      
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
      
      const imageData = imageCache.get(imageSrc) ?? null;
      await addImageToPDF(doc, imageData, x, y, photoWidth, photoHeight, fileName);
      
      if ((i + 1) % photosPerRow === 0 || i === generalPhotos.length - 1) {
        yPos = y + photoHeight + photoSpacing;
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
  // SECTION 6: INSPECTION CHECKLIST (Table Format)
  // ============================================
  for (const category of checklist) {
    if (!category || !category.category) continue;
    
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }
    
    // Category header
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(category.category, margin + 6, yPos + 2);
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
    
    // Table for checklist items
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
        0: { cellWidth: 75, fontStyle: 'bold', textColor: [30, 30, 40], halign: 'left' },
        1: { cellWidth: 28, halign: 'center', fontStyle: 'bold', textColor: [79, 70, 229] },
        2: { cellWidth: 'auto', textColor: [60, 60, 80], halign: 'left' },
        3: { cellWidth: 35, halign: 'center', fontSize: 8, textColor: [100, 100, 120] },
      },
      margin: { left: margin, right: margin },
      styles: { overflow: 'linebreak', cellPadding: 3 },
      alternateRowStyles: {
        fillColor: [252, 252, 255],
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 12;
    
    // Add item photos
    for (const item of items) {
      if (!item.photos || item.photos.length === 0) continue;
      
      if (yPos > pageHeight - 90) {
        doc.addPage();
        yPos = 20;
      }
      
      // Item photo header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${item.item} - Photos:`, margin + 6, yPos);
      yPos += 8;
      
      // Photos grid (3 per row) - capped for speed
      const itemPhotoWidth = (contentWidth - 12) / 3;
      const itemPhotoHeight = itemPhotoWidth * 0.75;
      const photoSpacing = 6;
      const itemPhotosSlice = item.photos.slice(0, MAX_PHOTOS_PER_CHECKLIST_ITEM);
      
      for (let i = 0; i < itemPhotosSlice.length; i++) {
        const photo = itemPhotosSlice[i];
        const fileName = typeof photo === 'string' ? photo : (photo as any).fileName;
        const imageSrc = typeof photo === 'object' && (photo as any)?.url ? (photo as any).url : fileName;
        
        if (yPos + itemPhotoHeight > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }
        
        const col = i % 3;
        const row = Math.floor(i / 3);
        
        const x = margin + 6 + (col * (itemPhotoWidth + photoSpacing));
        const y = yPos + (row * (itemPhotoHeight + photoSpacing));
        
        const imageData = imageCache.get(imageSrc) ?? null;
        await addImageToPDF(doc, imageData, x, y, itemPhotoWidth, itemPhotoHeight, fileName);
        
        if ((i + 1) % 3 === 0 || i === itemPhotosSlice.length - 1) {
          yPos = y + itemPhotoHeight + photoSpacing;
        }
      }
      
      yPos += 8;
    }
    
    yPos += 5;
  }

  // ============================================
  // SECTION 7: SIGNATURES (Table)
  // ============================================
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }

  const signatureWidth = (contentWidth - 20) / 2;
  const signatureHeight = 35;
  const signatureSpacing = 20;

  // Technician Signature
  const techSigX = margin + 10;
  const techSigY = yPos + 5;

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
  const mgrSigY = yPos + 5;

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

  // Signature labels
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 80);
  doc.text('Technician Signature:', techSigX, yPos);
  doc.text('Manager Signature:', mgrSigX, yPos);

  // ============================================
  // SECTION 8: ADDITIONAL INFORMATION (Table)
  // ============================================
  yPos = mgrSigY + signatureHeight + 20;

  if (yPos > pageHeight - 70) {
    doc.addPage();
    yPos = 20;
  }

  // Section title
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, yPos - 5, contentWidth, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Additional Information', margin + 6, yPos + 2);
  yPos += 12;

  const additionalFields = [
    ['Privacy Consent', formatValue(inspection.privacyConsent)],
    ['Data Retention Days', formatValue(inspection.dataRetentionDays)],
    ['Created At', formatValue(inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : null)],
    ['Updated At', formatValue(inspection.updatedAt ? new Date(inspection.updatedAt).toLocaleString() : null)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Field', 'Value']],
    body: additionalFields,
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto', textColor: [30, 30, 40] },
    },
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    alternateRowStyles: {
      fillColor: [252, 252, 255],
    },
  });

  // ============================================
  // FOOTER - On Every Page
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
