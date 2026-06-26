import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const defaultPosition = {
  lat: -6.2088,
  lng: 106.8456,
};

// RecenterMap component to handle smooth pan/zoom movement to new locations
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, {
        animate: true,
        duration: 1.2, // duration of transition in seconds
      });
    }
  }, [center, map]);
  return null;
}

// LocationMarker component to handle click and drag events
function LocationMarker({ position, onMarkerMove }) {
  useMapEvents({
    click(e) {
      onMarkerMove(e.latlng);
    },
  });

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          onMarkerMove(e.target.getLatLng());
        },
      }}
    />
  );
}

export default function LeafletMapPicker({ onLocationChange }) {
  const [position, setPosition] = useState(defaultPosition);
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimerRef = useRef(null);
  const searchContainerRef = useRef(null);

  // 2. Add console.log for state changes (suggestions and showDropdown)
  useEffect(() => {
    console.log("State: suggestions =", suggestions);
  }, [suggestions]);

  useEffect(() => {
    console.log("State: showDropdown =", showDropdown);
  }, [showDropdown]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Notify parent component of the default position on mount with an empty address string
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange({
        address: "",
        latitude: defaultPosition.lat,
        longitude: defaultPosition.lng,
      });
    }
  }, []);

  // 1. Ensure handleInputChange is called and log the value
  const handleInputChange = (value) => {
    console.log("Input value:", value);
    setQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      setLoading(false);
      setShowDropdown(false);
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // 8. Ensure debounce doesn't prevent the first request (timeout is set correctly and fires)
    searchTimerRef.current = setTimeout(async () => {
      try {
        // 3. Request search is successful and not blocked (CORS-friendly query params)
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: value,
              format: "json",
              limit: 5,
              "accept-language": "id",
              email: "raflyhr.tukangaja@gmail.com",
            },
          }
        );
        // 2. Log response.data from Nominatim
        console.log("Nominatim response.data (Debounced Search):", response.data);
        
        // 4. Ensure response.data is set to the state suggestions
        setSuggestions(response.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce
  };

  // 5. Ensure showDropdown becomes true when query >= 3 and suggestions have contents
  useEffect(() => {
    if (query.length >= 3 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  }, [query, suggestions]);

  // 7. Perform immediate Enter search
  const performImmediateSearch = async (searchQuery) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (searchQuery.length < 3) return;

    setLoading(true);
    setShowDropdown(true);

    try {
      console.log("Performing immediate Enter search for:", searchQuery);
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: searchQuery,
            format: "json",
            limit: 5,
            "accept-language": "id",
            email: "raflyhr.tukangaja@gmail.com",
          },
        }
      );
      
      // 2. Log response.data from Nominatim
      console.log("Nominatim response.data (Enter Search):", response.data);
      
      // 4. Set suggestions state
      setSuggestions(response.data);

      // 13. If search finds results, automatically select and navigate to the first one
      if (response.data && response.data.length > 0) {
        handleSelectSuggestion(response.data[0]);
      } else {
        setShowDropdown(true); // Ensure dropdown stays open to show "Alamat tidak ditemukan"
      }
    } catch (err) {
      console.error("Enter search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 13. Handle selecting a suggestion
  const handleSelectSuggestion = (item) => {
    const newPosition = {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };

    setPosition(newPosition);
    setMapCenter(newPosition);
    setQuery(item.display_name);
    setSuggestions([]);
    setShowDropdown(false);

    if (onLocationChange) {
      onLocationChange({
        address: item.display_name,
        latitude: newPosition.lat,
        longitude: newPosition.lng,
      });
    }
  };

  // Handle marker drag or map click (Reverse Geocoding)
  const handleMarkerMove = async (latlng) => {
    setPosition(latlng);

    // Call Nominatim Reverse API to get address
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat: latlng.lat,
            lon: latlng.lng,
            format: "json",
            "accept-language": "id",
            email: "raflyhr.tukangaja@gmail.com",
          },
        }
      );

      if (response.data && response.data.display_name) {
        const address = response.data.display_name;
        setQuery(address);

        if (onLocationChange) {
          onLocationChange({
            address: address,
            latitude: latlng.lat,
            longitude: latlng.lng,
          });
        }
      } else {
        // Fallback if address display name is not found
        const fallbackAddress = `Koordinat: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        setQuery(fallbackAddress);
        if (onLocationChange) {
          onLocationChange({
            address: fallbackAddress,
            latitude: latlng.lat,
            longitude: latlng.lng,
          });
        }
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      // Fallback on network/API error
      const fallbackAddress = `Koordinat: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
      setQuery(fallbackAddress);
      if (onLocationChange) {
        onLocationChange({
          address: fallbackAddress,
          latitude: latlng.lat,
          longitude: latlng.lng,
        });
      }
    }
  };

  return (
    <div className="w-full flex flex-col font-sans" ref={searchContainerRef}>
      {/* Search Input Container */}
      {/* 12. Ensure dropdown is exactly under the input container */}
      <div className="relative mb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari alamat..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (query.length >= 3) {
                setShowDropdown(true);
              }
            }}
            onKeyDown={(e) => {
              // 7. Enter triggers immediate search
              if (e.key === "Enter") {
                e.preventDefault();
                performImmediateSearch(query);
              }
            }}
            className="w-full rounded-lg border border-outline-variant bg-[#2a2a2a] text-on-surface p-3 pr-10 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all font-body-md text-body-md"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 text-secondary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showDropdown && query.length >= 3 && (
          <div className="absolute z-50 mt-1 w-full bg-[#2a2a2a] border border-outline-variant rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
            {loading && suggestions.length === 0 ? (
              <div className="p-3 text-sm text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary animate-pulse">
                  search
                </span>
                Mencari lokasi...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <div
                  key={index}
                  className="p-3 cursor-pointer hover:bg-[#353534] text-on-surface flex items-start gap-2 border-b border-[#414751]/30 last:border-none transition-colors"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <span className="material-symbols-outlined text-secondary mt-0.5 text-lg select-none">
                    location_on
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">
                      {item.display_name}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // 6. Display "Alamat tidak ditemukan" if response.data is empty
              <div className="p-3 text-sm text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">
                  error_outline
                </span>
                Alamat tidak ditemukan
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full rounded-xl overflow-hidden border border-outline-variant shadow-md">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{
            height: "320px",
            width: "100%",
            borderRadius: "12px",
          }}
        >
          <RecenterMap center={mapCenter} />

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <LocationMarker
            position={position}
            onMarkerMove={handleMarkerMove}
          />
        </MapContainer>
      </div>
    </div>
  );
}
