import exifr from 'exifr';

export interface PhotoMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  make?: string;
  model?: string;
  dateTime?: string;
  latitude?: number;
  longitude?: number;
  orientation?: number;
  software?: string;
  [key: string]: any;
}

export async function extractEXIFMetadata(file: File | Buffer | ArrayBuffer, fileName?: string, fileSize?: number, mimeType?: string): Promise<PhotoMetadata> {
  let arrayBuffer: ArrayBuffer;
  let metadataFileName: string;
  let metadataFileSize: number;
  let metadataMimeType: string;

  // Handle different input types
  if (file instanceof File) {
    arrayBuffer = await file.arrayBuffer();
    metadataFileName = file.name;
    metadataFileSize = file.size;
    metadataMimeType = file.type;
  } else if (Buffer.isBuffer(file)) {
    // Convert Buffer to ArrayBuffer properly
    // Copy the buffer to ensure we get a proper ArrayBuffer (not SharedArrayBuffer)
    const uint8Array = new Uint8Array(file.length);
    uint8Array.set(file);
    arrayBuffer = uint8Array.buffer;
    metadataFileName = fileName || 'unknown';
    metadataFileSize = fileSize || file.length;
    metadataMimeType = mimeType || 'application/octet-stream';
  } else {
    // Already an ArrayBuffer
    arrayBuffer = file;
    metadataFileName = fileName || 'unknown';
    metadataFileSize = fileSize || arrayBuffer.byteLength;
    metadataMimeType = mimeType || 'application/octet-stream';
  }

  const metadata: any = await exifr.parse(arrayBuffer, {
    pick: [
      'Make',
      'Model',
      'DateTimeOriginal',
      'GPSLatitude',
      'GPSLongitude',
      'Orientation',
      'Software',
      'ImageWidth',
      'ImageHeight',
    ],
  });

  return {
    fileName: metadataFileName,
    fileSize: metadataFileSize,
    mimeType: metadataMimeType,
    width: metadata?.ImageWidth,
    height: metadata?.ImageHeight,
    make: metadata?.Make,
    model: metadata?.Model,
    dateTime: metadata?.DateTimeOriginal,
    latitude: metadata?.GPSLatitude,
    longitude: metadata?.GPSLongitude,
    orientation: metadata?.Orientation,
    software: metadata?.Software,
    ...metadata,
  };
}

