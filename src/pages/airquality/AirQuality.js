import React from "react";
import { useSelector } from "react-redux";
import { useLiveAQI } from "../../hooks/useLiveAQI";
import { Row, Col } from "reactstrap";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Widget from "../../components/Widget/Widget.js";
import FiltersBar from "../../components/FiltersBar/FiltersBar.js";
import AQIMap from "../../components/AQIMap/AQIMap.js";
import s from "./AirQuality.module.scss";
import data from "../../data/environmentData.json";

// ── Helpers ────────────────────────────────────────────────────────────────
const AQI_LEVELS = [
  { label: "Good",              range: "0 – 50",   color: "#41D5E2", bg: "#41D5E215" },
  { label: "Moderate",          range: "51 – 100",  color: "#FFC405", bg: "#FFC40515" },
  { label: "Unhealthy (Sens.)", range: "101 – 150", color: "#FF8C00", bg: "#FF8C0015" },
  { label: "Unhealthy",         range: "151 – 200", color: "#FF5668", bg: "#FF566815" },
];

const getAQIStatus = (aqi) => {
  if (aqi <= 50)  return AQI_LEVELS[0];
  if (aqi <= 100) return AQI_LEVELS[1];
  if (aqi <= 150) return AQI_LEVELS[2];
  return AQI_LEVELS[3];
};

// ── Component ──────────────────────────────────────────────────────────────
const AirQuality = () => {
  const selected = useSelector((state) => state.filters.district);
  const { data: liveAQI } = useLiveAQI("tashkent");

  const liveMarker = liveAQI
    ? { lat: liveAQI.lat, lng: liveAQI.lng, aqi: liveAQI.aqi, label: "Tashkent (Live)" }
    : null;

  // Pick the right monthly dataset based on selected district
  const chartData =
    selected === "All Districts"
      ? data.monthly
      : data.districtMonthly[selected];

  // KPI values — last month in the selected dataset
  const latest = chartData[chartData.length - 1];
  const avgAQI  = Math.round(chartData.reduce((s, r) => s + r.aqi,  0) / chartData.length);
  const avgPM25 = (chartData.reduce((s, r) => s + r.pm25, 0) / chartData.length).toFixed(1);
  const avgPM10 = (chartData.reduce((s, r) => s + r.pm10, 0) / chartData.length).toFixed(1);
  const status  = getAQIStatus(avgAQI);

  // District row for the selected district (used in detail card)
  const districtDetail =
    selected !== "All Districts"
      ? data.districts.find((d) => d.name === selected)
      : null;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h2 className="headline-2 mb-1">Air Quality</h2>
          <p className="body-3 muted">AQI · PM2.5 · PM10 — Tashkent 2025</p>
        </div>
      </div>

      {/* ── District Filter (global) ── */}
      <FiltersBar showDistrict />

      {/* ── KPI Cards ── */}
      <Row className="gutter mb-4">
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#4D53E015" }}>
              <i className="eva eva-cloud-outline" style={{ color: "#4D53E0", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{avgAQI}</p>
            <p className="body-3 muted mb-0">Avg AQI</p>
            <span className="body-3" style={{ color: status.color, fontWeight: 500 }}>
              {status.label}
            </span>
          </Widget>
        </Col>
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#FF566815" }}>
              <i className="eva eva-activity-outline" style={{ color: "#FF5668", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{avgPM25}</p>
            <p className="body-3 muted mb-0">Avg PM2.5 (µg/m³)</p>
            <span className="body-3 muted">WHO limit: 15 µg/m³</span>
          </Widget>
        </Col>
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#FFC40515" }}>
              <i className="eva eva-bar-chart-outline" style={{ color: "#FFC405", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{avgPM10}</p>
            <p className="body-3 muted mb-0">Avg PM10 (µg/m³)</p>
            <span className="body-3 muted">WHO limit: 45 µg/m³</span>
          </Widget>
        </Col>
        <Col xs={6} md={3}>
          <Widget className={`widget-p-md ${s.kpiCard}`} style={{ borderLeft: `4px solid ${status.color}` }}>
            <div className={s.kpiIcon} style={{ background: status.bg }}>
              <i className="eva eva-shield-outline" style={{ color: status.color, fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{latest.aqi}</p>
            <p className="body-3 muted mb-0">Latest AQI (Dec)</p>
            <span className="body-3" style={{ color: status.color, fontWeight: 500 }}>
              {status.label}
            </span>
          </Widget>
        </Col>
      </Row>

      {/* ── Line Chart: AQI Trend ── */}
      <Row className="gutter mb-4">
        <Col xs={12}>
          <Widget className="widget-p-md">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
              <div>
                <p className="headline-3 mb-0">AQI Trend — 2025</p>
                <p className="body-3 muted mb-0">
                  {selected === "All Districts" ? "City-wide average" : selected} · monthly
                </p>
              </div>
              <div className={s.legendNote}>
                <span className={s.dot} style={{ background: "#FFC405" }} /> Moderate (&gt;50)
                <span className={s.dot} style={{ background: "#FF5668", marginLeft: 12 }} /> Unhealthy (&gt;100)
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 160]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  formatter={(val, name) => [`${val}`, name]}
                />
                <Legend />
                {/* Reference lines for AQI category boundaries */}
                <ReferenceLine y={50}  stroke="#41D5E2" strokeDasharray="4 4" label={{ value: "Good", fontSize: 11, fill: "#41D5E2" }} />
                <ReferenceLine y={100} stroke="#FFC405" strokeDasharray="4 4" label={{ value: "Moderate", fontSize: 11, fill: "#FFC405" }} />
                <ReferenceLine y={150} stroke="#FF5668" strokeDasharray="4 4" label={{ value: "Unhealthy", fontSize: 11, fill: "#FF5668" }} />
                <Line
                  type="monotone" dataKey="aqi" name="AQI"
                  stroke="#4D53E0" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#4D53E0" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Widget>
        </Col>
      </Row>

      {/* ── District AQI Map ── */}
      <Row className="gutter mb-4">
        <Col xs={12}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">District AQI Map — Tashkent 2025</p>
            <p className="body-3 muted mb-3">
              Circle size is fixed · color indicates AQI level per district
            </p>
            <AQIMap districts={data.districts} liveMarker={liveMarker} height="380px" />
          </Widget>
        </Col>
      </Row>

      {/* ── Bar Chart: PM2.5 vs PM10 + AQI Reference ── */}
      <Row className="gutter">
        <Col xs={12} lg={8} className="mb-4 mb-lg-0">
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">PM2.5 vs PM10 — Monthly Breakdown</p>
            <p className="body-3 muted mb-3">
              {selected === "All Districts" ? "City-wide average" : selected} · µg/m³
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Legend />
                <Bar dataKey="pm25" name="PM2.5 (µg/m³)" fill="#FF5668" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pm10" name="PM10 (µg/m³)"  fill="#4D53E0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </Col>

        {/* AQI Reference Card */}
        <Col xs={12} lg={4}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-1">AQI Reference</p>
            <p className="body-3 muted mb-3">WHO / US EPA categories</p>
            {AQI_LEVELS.map((level) => (
              <div
                key={level.label}
                className={s.aqiLevel}
                style={{ background: level.bg, borderLeft: `4px solid ${level.color}` }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <p className="body-2 mb-0" style={{ color: level.color, fontWeight: 600 }}>
                    {level.label}
                  </p>
                  <p className="body-3 muted mb-0">{level.range}</p>
                </div>
              </div>
            ))}

            {/* District detail if one is selected */}
            {districtDetail && (
              <div className={`mt-4 ${s.districtDetail}`}>
                <p className="headline-3 mb-2">{districtDetail.name}</p>
                <div className="d-flex justify-content-between">
                  <p className="body-3 muted mb-1">Current AQI</p>
                  <p className="body-3 mb-1" style={{ color: getAQIStatus(districtDetail.aqi).color }}>
                    {districtDetail.aqi}
                  </p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="body-3 muted mb-1">PM2.5</p>
                  <p className="body-3 mb-1">{districtDetail.pm25} µg/m³</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="body-3 muted mb-1">PM10</p>
                  <p className="body-3 mb-1">{districtDetail.pm10} µg/m³</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="body-3 muted mb-0">Population</p>
                  <p className="body-3 mb-0">{(districtDetail.population / 1000).toFixed(0)}k</p>
                </div>
              </div>
            )}
          </Widget>
        </Col>
      </Row>
    </div>
  );
};

export default AirQuality;
