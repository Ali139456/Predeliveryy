'use client';

import { useState, useEffect } from 'react';
import { MapPin, Play, Navigation } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: Date;
}

interface EnhancedGPSLocationProps {
  onLocationChange: (location: {
    start?: LocationData;
    current?: { latitude: number; longitude: number; address?: string };
  }) => void;
  value?: {
    start?: LocationData;
    current?: { latitude: number; longitude: number; address?: string };
  };
  readOnly?: boolean;
}

export default function EnhancedGPSLocation({ onLocationChange, value, readOnly = false }: EnhancedGPSLocationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number; address?: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address from reverse geocoding (using free service)
          let address: string | undefined;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
              address = data.display_name;
            }
          } catch (err) {
            // Ignore geocoding errors
          }

          resolve({ latitude, longitude, address });
        },
        (err) => {
          reject(new Error(`Failed to get location: ${err.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const captureStartLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      const startData: LocationData = {
        ...location,
        timestamp: new Date(),
      };
      
      onLocationChange({
        ...value,
        start: startData,
        current: location,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-black flex items-center">
          <Navigation className="w-4 h-4 mr-2" />
          GPS Location Tracking
        </label>
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={captureStartLocation}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-[#0040FF] text-white rounded-lg hover:bg-[#0040FF]/90 disabled:opacity-50 transition-colors"
        >
          <Play className="w-4 h-4 mr-2" />
          Capture Start
        </button>
      )}

      {value?.start && (
        <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-black">Start Location</p>
              <p className="text-sm text-black">
                {value.start.latitude.toFixed(6)}, {value.start.longitude.toFixed(6)}
              </p>
              {value.start.address && (
                <p className="text-xs text-black/70 mt-1">{value.start.address}</p>
              )}
              <p className="text-xs text-black/70 mt-1">
                {new Date(value.start.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}


      {value?.current && (
        <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-600 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-black">Current Location</p>
              <p className="text-sm text-black">
                {value.current.latitude.toFixed(6)}, {value.current.longitude.toFixed(6)}
              </p>
              {value.current.address && (
                <p className="text-xs text-black/70 mt-1">{value.current.address}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

