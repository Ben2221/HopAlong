import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, Icon, LatLngBounds } from "leaflet";
import { useRouteStore } from "../store/routeStore";
import { useEffect, useMemo, useState } from "react";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Fix for Leaflet default icon issue in React
const defaultIcon = new Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Origin marker (green)
const originIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Destination marker (red)
const destinationIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to fit bounds when origin and destination change
const FitBounds = ({
  from,
  to,
}: {
  from: LatLngExpression | null;
  to: LatLngExpression | null;
}) => {
  const map = useMap();
  const [initialRender, setInitialRender] = useState(true);
  const defaultPosition = useMemo(
    () => [9.754833, 76.650099] as LatLngExpression,
    []
  );

  useEffect(() => {
    // On initial render, show default position first
    if (initialRender) {
      map.setView(defaultPosition, 15);

      // Wait a moment before checking for stored positions
      const timer = setTimeout(() => {
        setInitialRender(false);
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    } else {
      const animationOptions = {
        duration: 1.5,
        easeLinearity: 0.25,
      };

      if (from && to) {
        const bounds = new LatLngBounds([from, to]);
        map.flyToBounds(bounds, {
          padding: [50, 50],
          ...animationOptions,
        });
      } else if (from) {
        map.flyTo(from, 15, animationOptions);
      } else if (to) {
        map.flyTo(to, 15, animationOptions);
      }
    }
  }, [map, from, to, initialRender, defaultPosition]);

  return null;
};

const Map = () => {
  const defaultPosition = [9.754833, 76.650099] as LatLngExpression;
  const { from, to } = useRouteStore();

  const fromPosition = from
    ? ([from.latitude, from.longitude] as LatLngExpression)
    : null;
  const toPosition = to
    ? ([to.latitude, to.longitude] as LatLngExpression)
    : null;

  return (
    <MapContainer
      center={fromPosition ?? toPosition ?? defaultPosition}
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", minHeight: "500px" }}
      className="flex-1"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Origin marker */}
      {fromPosition && (
        <Marker position={fromPosition} icon={originIcon}>
          <Popup>
            <strong>Origin:</strong> {from?.name}
            <br />
            {from?.formattedAddress}
          </Popup>
        </Marker>
      )}

      {/* Destination marker */}
      {toPosition && (
        <Marker position={toPosition} icon={destinationIcon}>
          <Popup>
            <strong>Destination:</strong> {to?.name}
            <br />
            {to?.formattedAddress}
          </Popup>
        </Marker>
      )}

      {/* Default marker if no from/to */}
      {!fromPosition && !toPosition && (
        <Marker position={defaultPosition} icon={defaultIcon}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      )}

      {/* Auto-fit bounds when both points are available */}
      <FitBounds from={fromPosition} to={toPosition} />
    </MapContainer>
  );
};

export default Map;
