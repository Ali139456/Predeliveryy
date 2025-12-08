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

export async function extractEXIFMetadata(file: File): Promise<PhotoMetadata> {
  const arrayBuffer = await file.arrayBuffer();
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
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
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

