import { useState, useCallback } from "react";
import {
  GoogleMap,
  MarkerF,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

const libraries = ["places"];

const containerStyle = {
  width: "100%",
  height: "320px",
  borderRadius: "12px",
};

const defaultCenter = {
  lat: -6.2088,
  lng: 106.8456,
};

export default function GoogleMapPicker({ onLocationChange }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState(null);
  const [map, setMap] = useState(null);
  const [address, setAddress] = useState("");

  const updateLocationDetails = useCallback((location, formattedAddress) => {
    setMarkerPosition(location);
    if (onLocationChange) {
      onLocationChange({
        address: formattedAddress,
        latitude: location.lat,
        longitude: location.lng,
      });
    }
  }, [onLocationChange]);

  const handleMapAction = useCallback((lat, lng, pan = false) => {
    const location = { lat, lng };
    setMarkerPosition(location);

    if (pan && map) {
      map.panTo(location);
    }

    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          updateLocationDetails(location, formattedAddress);
        } else {
          console.error("Geocoder failed due to: " + status);
          updateLocationDetails(location, "Alamat tidak ditemukan");
        }
      });
    } else {
      updateLocationDetails(location, "Google Maps tidak dimuat");
    }
  }, [map, updateLocationDetails]);

  const handleMapClick = useCallback((e) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    handleMapAction(lat, lng, true);
  }, [handleMapAction]);

  const handleMarkerDragEnd = useCallback((e) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    handleMapAction(lat, lng, false);
  }, [handleMapAction]);

  const onPlaceChanged = useCallback(() => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) return;

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    const formattedAddress = place.formatted_address || place.name || "";
    setAddress(formattedAddress);
    setMarkerPosition(location);

    if (map) {
      map.panTo(location);
    }

    if (onLocationChange) {
      onLocationChange({
        address: formattedAddress,
        latitude: location.lat,
        longitude: location.lng,
      });
    }
  }, [autocomplete, map, onLocationChange]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-950/20 p-4 text-red-400 text-sm">
        Gagal memuat Google Maps. Harap periksa kunci API, penagihan, atau koneksi internet Anda.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl bg-[#2B2B2B] text-gray-400 text-sm animate-pulse">
        Memuat Peta...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          placeholder="Cari alamat..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-xl border border-gray-600 bg-[#2B2B2B] p-3 text-white outline-none focus:border-secondary transition-colors"
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={15}
        onClick={handleMapClick}
        onLoad={onMapLoad}
      >
        <MarkerF
          position={markerPosition}
          draggable
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>
    </div>
  );
}