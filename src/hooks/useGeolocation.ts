import { useState, useEffect } from 'react';

export interface GeolocationState {
  loading: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function useGeolocation(enabled = true) {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: "Geolocation is not supported by your browser.",
        latitude: null,
        longitude: null,
      });
      return;
    }

    const success = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const error = (err: GeolocationPositionError) => {
      let errorMessage = "Unable to retrieve your location.";
      if (err.code === err.PERMISSION_DENIED) {
        errorMessage = "Location permission denied.";
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        errorMessage = "Location information is unavailable.";
      } else if (err.code === err.TIMEOUT) {
        errorMessage = "The request to get user location timed out.";
      }
      
      setState({
        loading: false,
        error: errorMessage,
        latitude: null,
        longitude: null,
      });
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, [enabled]);

  return state;
}
