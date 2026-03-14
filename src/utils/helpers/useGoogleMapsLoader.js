// utils/useGoogleMapsLoader.js
import { useJsApiLoader } from '@react-google-maps/api';

export const useGoogleMapsLoader = () => {
  return useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    libraries: ['places'], // include all libs you might need
  });
};
