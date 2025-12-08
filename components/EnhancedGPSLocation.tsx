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
        <label className="text-sm font-medium text-slate-200 flex items-center">
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
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Capture Start
            </button>
            <button
              type="button"
              onClick={captureEndLocation}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
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
              className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
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
        <div className="p-4 bg-green-900/40 border border-green-500/50 rounded-lg bg-slate-800/95">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-200">Start Location</p>
              <p className="text-sm text-green-300">
                {value.start.latitude.toFixed(6)}, {value.start.longitude.toFixed(6)}
              </p>
              {value.start.address && (
                <p className="text-xs text-green-400 mt-1">{value.start.address}</p>
              )}
              <p className="text-xs text-green-400 mt-1">
                {new Date(value.start.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {value?.end && (
        <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-lg bg-slate-800/95">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-200">End Location</p>
              <p className="text-sm text-red-300">
                {value.end.latitude.toFixed(6)}, {value.end.longitude.toFixed(6)}
              </p>
              {value.end.address && (
                <p className="text-xs text-red-400 mt-1">{value.end.address}</p>
              )}
              <p className="text-xs text-red-400 mt-1">
                {new Date(value.end.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {value?.roadTest && (
        <div className="p-4 bg-blue-900/40 border border-blue-500/50 rounded-lg bg-slate-800/95">
          <div className="flex items-start">
            <Navigation className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200">Road Test</p>
              <p className="text-sm text-blue-300">
                Distance: {value.roadTest.distance?.toFixed(2) || '0.00'} km
              </p>
              <p className="text-sm text-blue-300">
                Duration: {value.roadTest.duration || 0} minutes
              </p>
              <p className="text-xs text-blue-400 mt-1">
                Route points: {value.roadTest.route?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {value?.current && (
        <div className="p-4 bg-slate-700/50 border border-slate-500/50 rounded-lg bg-slate-800/95">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-slate-300 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">Current Location</p>
              <p className="text-sm text-slate-300">
                {value.current.latitude.toFixed(6)}, {value.current.longitude.toFixed(6)}
              </p>
              {value.current.address && (
                <p className="text-xs text-slate-400 mt-1">{value.current.address}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300 text-sm bg-slate-800/95">
          {error}
        </div>
      )}
    </div>
  );
}

