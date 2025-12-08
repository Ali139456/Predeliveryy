import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IInspection } from '@/models/Inspection';
import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// Helper function to load image as base64
async function loadImageAsBase64(fileName: string): Promise<string | null> {
  try {
    const hasAWSCredentials = 
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_ACCESS_KEY_ID !== '' &&
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_SECRET_ACCESS_KEY !== '';

    if (!hasAWSCredentials) {
      // Load from local storage
      const localPath = path.join(process.cwd(), 'public', 'uploads', fileName);
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        const ext = path.extname(fileName).toLowerCase();
        const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                        ext === '.png' ? 'image/png' : 
                        ext === '.gif' ? 'image/gif' : 
                        ext === '.webp' ? 'image/webp' : 'image/jpeg';
        return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      }
    } else {
      // Load from S3 using S3 client
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
          // Convert stream to buffer
          const chunks: Buffer[] = [];
          const stream = response.Body as any;
          
          // Read the stream
          if (stream instanceof Buffer) {
            const buffer = stream;
            const ext = path.extname(fileName).toLowerCase();
            const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                            ext === '.png' ? 'image/png' : 
                            ext === '.gif' ? 'image/gif' : 
                            ext === '.webp' ? 'image/webp' : 'image/jpeg';
            return `data:${mimeType};base64,${buffer.toString('base64')}`;
          } else {
            // Read stream chunks
            for await (const chunk of stream) {
              chunks.push(Buffer.from(chunk));
            }
            const buffer = Buffer.concat(chunks);
            const ext = path.extname(fileName).toLowerCase();
            const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                            ext === '.png' ? 'image/png' : 
                            ext === '.gif' ? 'image/gif' : 
                            ext === '.webp' ? 'image/webp' : 'image/jpeg';
            return `data:${mimeType};base64,${buffer.toString('base64')}`;
          }
        }
      } catch (error) {
        console.warn(`Failed to load image from S3: ${fileName}`, error);
      }
    }
    return null;
  } catch (error) {
    console.warn(`Failed to load image: ${fileName}`, error);
    return null;
  }
}

// Helper function to add text with proper wrapping and alignment
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number = 10,
  lineHeight: number = 5,
  align: 'left' | 'center' | 'right' = 'left'
): number {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y, { align });
  return y + (lines.length * lineHeight);
}

// Helper function to create a professional section box
function createSectionBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  contentHeight: number,
  pageWidth: number
): number {
  const titleHeight = 9;
  const padding = 8;
  const boxHeight = titleHeight + contentHeight + padding;
  const boxY = y - titleHeight;
  
  // Light background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, boxY, width, boxHeight, 2, 2, 'F');
  
  // Border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, boxY, width, boxHeight, 2, 2);
  
  // Title background
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(x, boxY, width, titleHeight, 2, 2, 'F');
  
  // Title text
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, x + 6, y - 1);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  return y + 5; // Return starting Y for content
}

// Helper function to add image with proper aspect ratio and error handling
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
      // Add subtle border around image
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.rect(x, y, width, height);
    } catch (error) {
      console.warn(`Failed to add image to PDF: ${fileName || 'unknown'}`, error);
      // Placeholder box
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
    // Placeholder box
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
  // Debug: Log inspection data structure
  console.log('=== PDF Generation Debug ===');
  console.log('Inspection ID:', inspection._id);
  console.log('Has checklist:', !!inspection.checklist);
  console.log('Checklist type:', typeof inspection.checklist);
  console.log('Checklist is array:', Array.isArray(inspection.checklist));
  if (inspection.checklist) {
    console.log('Checklist length:', Array.isArray(inspection.checklist) ? inspection.checklist.length : 'N/A');
    if (Array.isArray(inspection.checklist) && inspection.checklist.length > 0) {
      console.log('First category:', JSON.stringify(inspection.checklist[0], null, 2));
    }
  }
  console.log('===========================');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // ============================================
  // HEADER - Professional Branded Header
  // ============================================
  doc.setFillColor(79, 70, 229); // Purple-600
  doc.rect(0, 0, pageWidth, 48, 'F');
  
  // Accent stripe
  doc.setFillColor(99, 102, 241); // Indigo-500
  doc.rect(0, 0, pageWidth, 4, 'F');
  
  // Logo/Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Hazard Inspect', margin, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 220, 255);
  doc.text('Comprehensive Vehicle Inspection System', margin, 30);
  
  // Generation timestamp
  doc.setFontSize(9);
  const generatedText = `Generated: ${new Date().toLocaleString()}`;
  doc.text(generatedText, pageWidth - margin, 20, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  let yPos = 58;
  
  // ============================================
  // SECTION 1: Inspector Information
  // ============================================
  const inspectorInfo = [
    { label: 'Inspection Number', value: inspection.inspectionNumber },
    { label: 'Inspector Name', value: inspection.inspectorName },
    { label: 'Email', value: inspection.inspectorEmail },
    { label: 'Inspection Date', value: new Date(inspection.inspectionDate).toLocaleDateString() }
  ];
  
  let contentY = createSectionBox(doc, margin, yPos, contentWidth, 'Inspector Information', inspectorInfo.length * 7, pageWidth);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const labelWidth = 50;
  for (const info of inspectorInfo) {
    // Label in bold
    doc.setFont('helvetica', 'bold');
    doc.text(`${info.label}:`, margin + 6, contentY);
    
    // Value in normal
    doc.setFont('helvetica', 'normal');
    const valueX = margin + 6 + labelWidth;
    const valueWidth = contentWidth - 12 - labelWidth;
    contentY = addWrappedText(doc, info.value || 'N/A', valueX, contentY, valueWidth, 10, 6);
    contentY += 2; // Extra spacing between items
  }
  
  // Status badge removed - no longer showing COMPLETED/DRAFT in PDF
  doc.setTextColor(0, 0, 0);
  yPos = contentY + 12;
  
  // ============================================
  // SECTION 2: GPS Location
  // ============================================
  if (inspection.location) {
    const hasStart = inspection.location.start && 
                     inspection.location.start.latitude != null && 
                     inspection.location.start.longitude != null;
    const hasEnd = inspection.location.end && 
                   inspection.location.end.latitude != null && 
                   inspection.location.end.longitude != null;
    const hasLocationData = hasStart || hasEnd;
    
    if (hasLocationData) {
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }
      
      // Calculate content height dynamically
      let locationContentHeight = 8; // Base padding
      if (hasStart) {
        locationContentHeight += 8; // Label
        locationContentHeight += 6; // Coordinates
        if (inspection.location.start?.address) locationContentHeight += 5;
        if (inspection.location.start?.timestamp) locationContentHeight += 4;
        locationContentHeight += 4; // Spacing
      }
      if (hasEnd) {
        locationContentHeight += 8; // Label
        locationContentHeight += 6; // Coordinates
        if (inspection.location.end?.address) locationContentHeight += 5;
        if (inspection.location.end?.timestamp) locationContentHeight += 4;
        locationContentHeight += 4; // Spacing
      }
      
      contentY = createSectionBox(doc, margin, yPos, contentWidth, 'GPS Location', locationContentHeight, pageWidth);
      
      if (hasStart && inspection.location.start) {
        // Start Location Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Inspection Start Location', margin + 6, contentY);
        contentY += 7;
        
        // Coordinates
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lat = inspection.location.start.latitude.toFixed(6);
        const lng = inspection.location.start.longitude.toFixed(6);
        doc.setFont('helvetica', 'bold');
        doc.text('Coordinates:', margin + 6, contentY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${lat}, ${lng}`, margin + 6 + 35, contentY);
        contentY += 6;
        
        // Address
        if (inspection.location.start.address) {
          doc.setFont('helvetica', 'bold');
          doc.text('Address:', margin + 6, contentY);
          doc.setFont('helvetica', 'normal');
          const addressLines = doc.splitTextToSize(inspection.location.start.address, contentWidth - 50);
          doc.text(addressLines, margin + 6 + 35, contentY);
          contentY += addressLines.length * 4 + 1;
        }
        
        // Timestamp
        if (inspection.location.start.timestamp) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'bold');
          doc.text('Time:', margin + 6, contentY);
          doc.setFont('helvetica', 'normal');
          const timeText = new Date(inspection.location.start.timestamp).toLocaleString();
          doc.text(timeText, margin + 6 + 35, contentY);
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          contentY += 4;
        }
        contentY += 4; // Extra spacing
      }
      
      if (hasEnd && inspection.location.end) {
        // End Location Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Inspection End Location', margin + 6, contentY);
        contentY += 7;
        
        // Coordinates
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lat = inspection.location.end.latitude.toFixed(6);
        const lng = inspection.location.end.longitude.toFixed(6);
        doc.setFont('helvetica', 'bold');
        doc.text('Coordinates:', margin + 6, contentY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${lat}, ${lng}`, margin + 6 + 35, contentY);
        contentY += 6;
        
        // Address
        if (inspection.location.end.address) {
          doc.setFont('helvetica', 'bold');
          doc.text('Address:', margin + 6, contentY);
          doc.setFont('helvetica', 'normal');
          const addressLines = doc.splitTextToSize(inspection.location.end.address, contentWidth - 50);
          doc.text(addressLines, margin + 6 + 35, contentY);
          contentY += addressLines.length * 4 + 1;
        }
        
        // Timestamp
        if (inspection.location.end.timestamp) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'bold');
          doc.text('Time:', margin + 6, contentY);
          doc.setFont('helvetica', 'normal');
          const timeText = new Date(inspection.location.end.timestamp).toLocaleString();
          doc.text(timeText, margin + 6 + 35, contentY);
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          contentY += 4;
        }
        contentY += 4; // Extra spacing
      }
      
      yPos = contentY + 12;
    }
  }
  
  // ============================================
  // SECTION 3: Barcode/QR Code
  // ============================================
  if (inspection.barcode) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    contentY = createSectionBox(doc, margin, yPos, contentWidth, 'Barcode / QR Code', 10, pageWidth);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const barcodeText = `Scanned Code: ${inspection.barcode}`;
    contentY = addWrappedText(doc, barcodeText, margin + 6, contentY, contentWidth - 12, 10, 6);
    yPos = contentY + 12;
  }
  
  // ============================================
  // SECTION 4: Vehicle Information
  // ============================================
  if (inspection.vehicleInfo) {
    const vehicleInfo = inspection.vehicleInfo;
    const infoItems = [
      vehicleInfo.make ? `Make: ${vehicleInfo.make}` : null,
      vehicleInfo.model ? `Model: ${vehicleInfo.model}` : null,
      vehicleInfo.year ? `Year: ${vehicleInfo.year}` : null,
      vehicleInfo.vin ? `VIN: ${vehicleInfo.vin}` : null,
      vehicleInfo.licensePlate ? `License Plate: ${vehicleInfo.licensePlate}` : null,
      vehicleInfo.bookingNumber ? `Booking Number: ${vehicleInfo.bookingNumber}` : null,
    ].filter(Boolean) as string[];
    
    if (infoItems.length > 0) {
      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = 20;
      }
      
      contentY = createSectionBox(doc, margin, yPos, contentWidth, 'Vehicle Information', infoItems.length * 6.5, pageWidth);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      for (const infoText of infoItems) {
        if (infoText.startsWith('VIN:')) {
          // Special formatting for VIN
          doc.setFont('helvetica', 'bold');
          doc.text('VIN:', margin + 6, contentY);
          doc.setFont('helvetica', 'normal');
          const vinValue = infoText.replace('VIN: ', '');
          doc.text(vinValue, margin + 6 + doc.getTextWidth('VIN: '), contentY);
        } else {
          contentY = addWrappedText(doc, infoText, margin + 6, contentY, contentWidth - 12, 10, 6);
        }
        contentY += 1;
      }
      
      yPos = contentY + 12;
    }
  }
  
  // ============================================
  // SECTION 5: General Photos
  // ============================================
  if (inspection.photos && inspection.photos.length > 0) {
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }
    
    // Section title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('General Photos', margin, yPos);
    yPos += 12;
    
    const photosPerRow = 2;
    const photoSpacing = 8;
    const photoWidth = (contentWidth - photoSpacing) / photosPerRow;
    const photoHeight = photoWidth * 0.75; // 4:3 aspect ratio
    
    let currentRowY = yPos;
    
    for (let i = 0; i < inspection.photos.length; i++) {
      const photo = inspection.photos[i];
      const fileName = typeof photo === 'string' ? photo : photo.fileName;
      
      const col = i % photosPerRow;
      const row = Math.floor(i / photosPerRow);
      
      // Check if we need a new page
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
      
      // Load and add image
      const imageData = await loadImageAsBase64(fileName);
      await addImageToPDF(doc, imageData, x, y, photoWidth, photoHeight, fileName);
      
      // Update yPos after completing a row
      if ((i + 1) % photosPerRow === 0 || i === inspection.photos.length - 1) {
        yPos = y + photoHeight + photoSpacing;
      }
    }
    
    yPos += 8; // Extra spacing after photos
  }
  
  // ============================================
  // SECTION 6: Inspection Checklist with Item Photos
  // ============================================
  let startY = yPos + 8;
  
  // Debug: Check checklist structure
  console.log('Checklist data:', JSON.stringify(inspection.checklist, null, 2));
  console.log('Checklist type:', typeof inspection.checklist);
  console.log('Checklist is array:', Array.isArray(inspection.checklist));
  
  // Ensure checklist is an array
  const checklist = Array.isArray(inspection.checklist) ? inspection.checklist : [];
  
  if (checklist.length === 0) {
    console.warn('No checklist data found in inspection');
    // Add a message that checklist is empty
    if (startY > pageHeight - 50) {
      doc.addPage();
      startY = 20;
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('No checklist items available', margin, startY);
    startY += 10;
  }
  
  for (const category of checklist) {
    // Check if we need a new page
    if (startY > pageHeight - 100) {
      doc.addPage();
      startY = 20;
    }
    
    // Validate category structure
    if (!category || !category.category) {
      console.warn('Invalid category structure:', category);
      continue;
    }
    
    // Category heading with professional styling
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(margin, startY - 6, contentWidth, 8, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(category.category || 'Unknown Category', margin + 6, startY);
    startY += 10;
    
    // Ensure items is an array
    const items = Array.isArray(category.items) ? category.items : [];
    
    if (items.length === 0) {
      // Show message if category has no items
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No items in this category', margin + 4, startY);
      startY += 8;
    }
    
    // Process each item in the category
    for (const item of items) {
      // Check if we need a new page before item
      if (startY > pageHeight - 150) {
        doc.addPage();
        startY = 20;
      }
      
      // Validate item structure
      if (!item || !item.item) {
        console.warn('Invalid item structure:', item);
        continue;
      }
      
      const itemStartY = startY;
      let itemContentY = startY;
      
      // Calculate approximate content height first
      const itemName = item.item || 'Unknown Item';
      const itemNameLines = doc.splitTextToSize(itemName, contentWidth - 60);
      let estimatedHeight = (itemNameLines.length * 5) + 8;
      
      if (item.notes && item.notes.trim()) {
        const notesLines = doc.splitTextToSize(`Notes: ${item.notes}`, contentWidth - 12);
        estimatedHeight += (notesLines.length * 4.5) + 4;
      }
      
      if (item.photos && item.photos.length > 0) {
        const itemPhotoHeight = ((contentWidth - 10) / 3) * 0.75;
        const photoRows = Math.ceil(item.photos.length / 3);
        estimatedHeight += (photoRows * (itemPhotoHeight + 5)) + 4;
      }
      
      // Draw item container box background FIRST (before content)
      const actualItemHeight = Math.max(estimatedHeight + 6, 12);
      doc.setFillColor(252, 252, 252);
      doc.roundedRect(margin, itemStartY - 2, contentWidth, actualItemHeight, 2, 2, 'F');
      
      // Now draw content on top of the background
      itemContentY = itemStartY + 4; // Start with padding inside box
      
      // Item name with wrapping - make sure it's visible
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0); // Black text
      doc.text(itemNameLines, margin + 6, itemContentY);
      itemContentY += (itemNameLines.length * 5) + 4;
      
      // Status badge - properly aligned
      const statusColor = item.status === 'pass' ? [34, 197, 94] : 
                         item.status === 'fail' ? [239, 68, 68] : 
                         [156, 163, 175];
      const statusText = item.status === 'pass' ? '✓ PASS' : 
                        item.status === 'fail' ? '✗ FAIL' : 
                        '➖ N/A';
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      const badgeWidth = 38;
      const badgeHeight = 6;
      const badgeY = itemStartY + 2; // Align with item name
      doc.roundedRect(pageWidth - margin - badgeWidth, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(statusText, pageWidth - margin - badgeWidth / 2, badgeY + 4, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset to black
      
      // Notes with wrapping - always show if notes exist
      if (item.notes && item.notes.trim()) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60); // Darker gray for better visibility
        const notesText = `Notes: ${item.notes}`;
        const notesLines = doc.splitTextToSize(notesText, contentWidth - 12);
        doc.text(notesLines, margin + 6, itemContentY);
        itemContentY += (notesLines.length * 4.5) + 4;
      }
      
      // Item photos - properly aligned grid
      if (item.photos && item.photos.length > 0) {
        const itemPhotoWidth = (contentWidth - 10) / 3; // 3 photos per row
        const itemPhotoHeight = itemPhotoWidth * 0.75;
        const photoSpacing = 5;
        
        // Check if we need a new page for photos
        if (itemContentY + itemPhotoHeight > pageHeight - 40) {
          doc.addPage();
          itemContentY = 20;
        }
        
        for (let i = 0; i < item.photos.length; i++) {
          const photo = item.photos[i];
          const fileName = typeof photo === 'string' ? photo : photo.fileName;
          
          // Check if we need a new page
          if (itemContentY + itemPhotoHeight > pageHeight - 40) {
            doc.addPage();
            itemContentY = 20;
          }
          
          const col = i % 3;
          const row = Math.floor(i / 3);
          
          // Calculate position
          const x = margin + 4 + (col * (itemPhotoWidth + photoSpacing));
          const y = itemContentY + (row * (itemPhotoHeight + photoSpacing));
          
          // Load and add image
          const imageData = await loadImageAsBase64(fileName);
          await addImageToPDF(doc, imageData, x, y, itemPhotoWidth, itemPhotoHeight, fileName);
          
          // Update itemContentY after completing a row
          if ((i + 1) % 3 === 0) {
            itemContentY = y + itemPhotoHeight + photoSpacing;
          }
        }
        
        // Update itemContentY if photos didn't fill a complete row
        if (item.photos.length % 3 !== 0) {
          const lastRow = Math.floor((item.photos.length - 1) / 3);
          itemContentY = itemContentY + (lastRow * (itemPhotoHeight + photoSpacing)) + itemPhotoHeight + photoSpacing;
        }
      }
      
      // Draw border AFTER all content (background was drawn first)
      const finalItemHeight = Math.max(itemContentY - itemStartY + 6, 12);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, itemStartY - 2, contentWidth, finalItemHeight, 2, 2, 'D');
      
      startY = itemContentY + 12; // Space between items
    }
    
    // Only add space if there were items in this category
    if (items.length > 0) {
      startY += 8; // Space between categories
    }
  }
  
  // ============================================
  // SECTION 7: Signatures
  // ============================================
  if (startY > pageHeight - 90) {
    doc.addPage();
    startY = 20;
  }
  
  contentY = createSectionBox(doc, margin, startY, contentWidth, 'Signatures', 38, pageWidth);
  
  const signatureWidth = (contentWidth - 12) / 2;
  const signatureHeight = 28;
  const signatureSpacing = 12;
  
  // Technician Signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Technician Signature:', margin + 6, contentY);
  
  const techSigX = margin + 6;
  const techSigY = contentY + 6;
  
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
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8);
      doc.text('Signature on file (image error)', techSigX + signatureWidth / 2, techSigY + signatureHeight / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(250, 250, 250);
    doc.rect(techSigX, techSigY, signatureWidth, signatureHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(techSigX, techSigY, signatureWidth, signatureHeight);
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text('Not signed', techSigX + signatureWidth / 2, techSigY + signatureHeight / 2, { align: 'center' });
  }
  
  // Manager Signature
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Manager Signature:', margin + 6 + signatureWidth + signatureSpacing, contentY);
  
  const mgrSigX = margin + 6 + signatureWidth + signatureSpacing;
  const mgrSigY = contentY + 6;
  
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
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8);
      doc.text('Signature on file (image error)', mgrSigX + signatureWidth / 2, mgrSigY + signatureHeight / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(250, 250, 250);
    doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(mgrSigX, mgrSigY, signatureWidth, signatureHeight);
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text('Not signed', mgrSigX + signatureWidth / 2, mgrSigY + signatureHeight / 2, { align: 'center' });
  }
  
  // ============================================
  // FOOTER - Professional Footer on Every Page
  // ============================================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
    
    // Page number
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    
    // Branding
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text('Hazard Inspect', pageWidth - margin, pageHeight - 8, { align: 'right' });
    
    // Copyright
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('© 2025 Hazard Inspect - All Rights Reserved', margin, pageHeight - 8);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}
