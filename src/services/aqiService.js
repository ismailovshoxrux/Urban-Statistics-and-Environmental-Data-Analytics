const TOKEN = process.env.REACT_APP_WAQI_TOKEN;
const BASE  = "https://api.waqi.info/feed";

/**
 * Fetch live AQI data for a city from the WAQI API.
 * @param {string} city  — e.g. "tashkent"
 * @returns {Promise<{ aqi, pm25, pm10, temperature, humidity, lat, lng, updatedAt }>}
 */
export async function fetchCityAQI(city = "tashkent") {
  const res  = await fetch(`${BASE}/${city}/?token=${TOKEN}`);
  const json = await res.json();

  if (json.status !== "ok") {
    throw new Error(`WAQI error: ${json.data}`);
  }

  const d = json.data;

  return {
    aqi:         d.aqi,
    pm25:        d.iaqi?.pm25?.v  ?? null,
    pm10:        d.iaqi?.pm10?.v  ?? null,
    temperature: d.iaqi?.t?.v     ?? null,
    humidity:    d.iaqi?.h?.v     ?? null,
    lat:         d.city?.geo?.[0] ?? 41.3111,
    lng:         d.city?.geo?.[1] ?? 69.2401,
    updatedAt:   d.time?.s        ?? null,
  };
}
