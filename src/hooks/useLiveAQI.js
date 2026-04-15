import { useState, useEffect } from "react";
import { fetchCityAQI } from "../services/aqiService";

/**
 * Custom hook — fetches live AQI once on mount.
 * Returns { data, loading, error }
 *   data: { aqi, pm25, pm10, temperature, humidity, lat, lng, updatedAt }
 */
export function useLiveAQI(city = "tashkent") {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchCityAQI(city)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [city]);

  return { data, loading, error };
}
