'use client';

import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Play, Square, Navigation } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: Date;
}

interface EnhancedGPSLocationProps {
  onLocationChange: (location: {
    start?: LocationData;
    end?: LocationData;
    current?: { latitude: number; longitude: number; address?: string };
    roadTest?: {
      distance?: number;
      duration?: number;
      route?: Array<{ latitude: number; longitude: number; timestamp: Date }>;
    };
  }) => void;
  value?: {
    start?: LocationData;
    end?: LocationData;
    current?: { latitude: number; longitude: number; address?: string };
    roadTest?: {
      distance?: number;
      duration?: number;
      route?: Array<{ latitude: number; longitude: number; timestamp: Date }>;
    };
  };
  readOnly?: boolean;
}

export default function EnhancedGPSLocation({ onLocationChange, value, readOnly = false }: EnhancedGPSLocationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadTestActive, setRoadTestActive] = useState(false);
  const [roadTestStartTime, setRoadTestStartTime] = useState<Date | null>(null);
  const [roadTestRoute, setRoadTestRoute] = useState<Array<{ latitude: number; longitude: number; timestamp: Date }>>([]);
  const [watchId, setWatchId] = useState<number | null>(null);

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

  const captureEndLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      const endData: LocationData = {
        ...location,
        timestamp: new Date(),
      };
      
      onLocationChange({
        ...value,
        end: endData,
        current: location,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startRoadTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      const startTime = new Date();
      setRoadTestStartTime(startTime);
      setRoadTestActive(true);
      
      const initialRoute: Array<{ latitude: number; longitude: number; timestamp: Date }> = [{
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: startTime,
      }];
      setRoadTestRoute(initialRoute);

      // Watch position during road test
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPoint = {
            latitude,
            longitude,
            timestamp: new Date(),
          };
          setRoadTestRoute((prev) => [...prev, newPoint]);
        },
        (err) => {
          setError(`Road test tracking error: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
      setWatchId(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopRoadTest = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setLoading(true);
    try {
      const endLocation = await getCurrentLocation();
      const endTime = new Date();
      
      // Calculate distance (Haversine formula)
      let totalDistance = 0;
      if (roadTestRoute.length > 1) {
        for (let i = 1; i < roadTestRoute.length; i++) {
          const prev = roadTestRoute[i - 1];
          const curr = roadTestRoute[i];
          totalDistance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
        }
      }

      // Calculate duration in minutes
      const duration = roadTestStartTime 
        ? Math.round((endTime.getTime() - roadTestStartTime.getTime()) / 60000)
        : 0;

      const roadTestData = {
        distance: totalDistance,
        duration,
        route: [...roadTestRoute, {
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
          timestamp: endTime,
        }],
      };

      onLocationChange({
        ...value,
        roadTest: roadTestData,
        current: endLocation,
      });

      setRoadTestActive(false);
      setRoadTestStartTime(null);
      setRoadTestRoute([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    // Cleanup watch on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-black flex items-center">
          <Navigation className="w-4 h-4 mr-2" />
          GPS Location Tracking
        </label>
      </div>

      {!readOnly && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={captureStartLocation}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-[#3833FF] text-white rounded-lg hover:bg-[#3833FF]/90 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Capture Start
            </button>
            <button
              type="button"
              onClick={captureEndLocation}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-[#3833FF] text-white rounded-lg hover:bg-[#3833FF]/90 disabled:opacity-50 transition-colors"
            >
              <Square className="w-4 h-4 mr-2" />
              Capture End
            </button>
          </div>

          {!roadTestActive ? (
            <button
              type="button"
              onClick={startRoadTest}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-[#3833FF] text-white rounded-lg hover:bg-[#3833FF]/90 disabled:opacity-50 transition-colors"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Start Road Test
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRoadTest}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Road Test ({roadTestRoute.length} points)
            </button>
          )}
        </>
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

      {value?.end && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-black">End Location</p>
              <p className="text-sm text-black">
                {value.end.latitude.toFixed(6)}, {value.end.longitude.toFixed(6)}
              </p>
              {value.end.address && (
                <p className="text-xs text-black/70 mt-1">{value.end.address}</p>
              )}
              <p className="text-xs text-black/70 mt-1">
                {new Date(value.end.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {value?.roadTest && (
        <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <div className="flex items-start">
            <Navigation className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-black">Road Test</p>
              <p className="text-sm text-black">
                Distance: {value.roadTest.distance?.toFixed(2) || '0.00'} km
              </p>
              <p className="text-sm text-black">
                Duration: {value.roadTest.duration || 0} minutes
              </p>
              <p className="text-xs text-black/70 mt-1">
                Route points: {value.roadTest.route?.length || 0}
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

