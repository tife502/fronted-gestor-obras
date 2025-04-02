import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const icon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const MapaUbicacion = ({ setUbicacion }) => {
  const [position, setPosition] = useState([4.813, -75.696]); // Ubicación inicial

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setUbicacion(`${e.latlng.lat}, ${e.latlng.lng}`);
      },
    });

    return position ? <Marker position={position} icon={icon} /> : null;
  };

  return (
    <div>
      <h2>Selecciona una ubicación</h2>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "400px", width: "100%", cursor: "pointer" }} // Cursor tipo "manita"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker />
      </MapContainer>
      <p>Ubicación seleccionada: {position.join(", ")}</p>
    </div>
  );
};

export default MapaUbicacion;

