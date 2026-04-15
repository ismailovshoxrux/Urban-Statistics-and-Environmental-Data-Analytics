import React, { useEffect, useRef } from "react";
import L from "leaflet";
import s from "./AQIMap.module.scss";

// Fix Leaflet default icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:       require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:     require("leaflet/dist/images/marker-shadow.png"),
});

// ── District coordinates (approximate centroids) ───────────────────────────
const DISTRICT_COORDS = {
  "Yunusabad":     [41.3615, 69.2820],
  "Chilanzar":     [41.2950, 69.2100],
  "Mirzo Ulugbek": [41.3200, 69.3300],
  "Shaykhantahur": [41.3280, 69.2560],
  "Uchtepa":       [41.3050, 69.2050],
  "Yakkasaray":    [41.3000, 69.2700],
};

const TASHKENT_CENTER = [41.3111, 69.2401];

// ── AQI → color + label ────────────────────────────────────────────────────
const getAQIStyle = (aqi) => {
  if (aqi <= 50)  return { fill: "#41D5E2", label: "Good"      };
  if (aqi <= 100) return { fill: "#FFC405", label: "Moderate"  };
  if (aqi <= 150) return { fill: "#FF8C00", label: "Sensitive" };
  return                  { fill: "#FF5668", label: "Unhealthy" };
};

// ── Component ──────────────────────────────────────────────────────────────
/**
 * AQIMap — plain Leaflet (no react-leaflet), works with CRA 4 / React 17.
 * Props:
 *   districts  {Array}  — data.districts array
 *   liveMarker {Object} — optional { lat, lng, aqi, label } live pin
 *   height     {string} — CSS height, default "380px"
 */
const AQIMap = ({ districts = [], liveMarker = null, height = "380px" }) => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // already initialised

    const map = L.map(containerRef.current, {
      center:           TASHKENT_CENTER,
      zoom:             12,
      scrollWheelZoom:  false,
      zoomControl:      true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // District circle markers
    districts.forEach((d) => {
      const coords = DISTRICT_COORDS[d.name];
      if (!coords) return;
      const { fill, label } = getAQIStyle(d.aqi);

      L.circleMarker(coords, {
        radius:      22,
        color:       fill,
        fillColor:   fill,
        fillOpacity: 0.55,
        weight:      2,
      })
        .bindTooltip(
          `<div style="line-height:1.4">
            <strong style="font-size:12px">${d.name}</strong><br/>
            <span style="color:${fill};font-weight:700;font-size:13px">AQI ${d.aqi}</span><br/>
            <span style="color:#6b7280;font-size:11px">${label}</span>
          </div>`,
          { permanent: true, direction: "top", offset: [0, -20], className: s.leafletTooltip }
        )
        .addTo(map);
    });

    // Optional live IQAir marker
    if (liveMarker) {
      L.circleMarker([liveMarker.lat, liveMarker.lng], {
        radius:      14,
        color:       "#4D53E0",
        fillColor:   "#4D53E0",
        fillOpacity: 0.85,
        weight:      3,
      })
        .bindTooltip(
          `<div style="line-height:1.4">
            <strong style="font-size:12px">${liveMarker.label}</strong><br/>
            <span style="color:#4D53E0;font-weight:700;font-size:13px">AQI ${liveMarker.aqi}</span><br/>
            <span style="color:#6b7280;font-size:11px">🔴 LIVE</span>
          </div>`,
          { permanent: true, direction: "top", offset: [0, -14], className: s.leafletTooltip }
        )
        .addTo(map);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update live marker if it changes after first mount
  useEffect(() => {
    if (!mapRef.current || !liveMarker) return;
    // Handled on initial mount; in Step 2 we will invalidate and re-render
  }, [liveMarker]);

  return (
    <div className={s.mapWrapper} style={{ height }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* Legend */}
      <div className={s.legend}>
        {[
          { color: "#41D5E2", label: "Good (≤50)"       },
          { color: "#FFC405", label: "Moderate (≤100)"  },
          { color: "#FF8C00", label: "Sensitive (≤150)" },
          { color: "#FF5668", label: "Unhealthy (>150)" },
        ].map((item) => (
          <div key={item.label} className={s.legendItem}>
            <span className={s.legendDot} style={{ background: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AQIMap;
