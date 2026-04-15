import React from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import Widget from "../../components/Widget/Widget.js";
import FiltersBar from "../../components/FiltersBar/FiltersBar.js";
import s from "./Climate.module.scss";
import data from "../../data/environmentData.json";

// ── Constants ──────────────────────────────────────────────────────────────
const YEARS = ["2023", "2024", "2025"];

const YEAR_COLORS = {
  "2023": "#41D5E2",
  "2024": "#FFC405",
  "2025": "#4D53E0",
};

const SEASONS = [
  { label: "Winter", months: [0, 1, 11], icon: "❄️" },
  { label: "Spring", months: [2, 3, 4],  icon: "🌱" },
  { label: "Summer", months: [5, 6, 7],  icon: "☀️" },
  { label: "Autumn", months: [8, 9, 10], icon: "🍂" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

// Build a merged dataset for the multi-year comparison chart
const buildComparisonData = () =>
  data.climateYearly["2025"].map((row, i) => ({
    month: row.month,
    "2023": data.climateYearly["2023"][i].temperature,
    "2024": data.climateYearly["2024"][i].temperature,
    "2025": data.climateYearly["2025"][i].temperature,
  }));

const computeKPIs = (yearData) => {
  const temps = yearData.map((r) => r.temperature);
  return {
    avg:  (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
    max:  Math.max(...temps).toFixed(1),
    min:  Math.min(...temps).toFixed(1),
    avgH: Math.round(yearData.reduce((a, r) => a + r.humidity, 0) / yearData.length),
  };
};

const computeSeasons = (yearData) =>
  SEASONS.map((s) => {
    const rows = s.months.map((i) => yearData[i]);
    const avg  = (rows.reduce((a, r) => a + r.temperature, 0) / rows.length).toFixed(1);
    const rain = rows.reduce((a, r) => a + r.precipitation, 0);
    return { ...s, avg, rain };
  });

// Build forecast chart data: last 6 months of 2025 + all of 2026 forecast
const buildForecastData = () => {
  const last6 = data.climateYearly["2025"].slice(6).map((r) => ({
    month:   `${r.month} '25`,
    actual:  r.temperature,
    predicted: null,
    upper:   null,
    lower:   null,
  }));
  const forecast = data.climateForecast2026.map((r) => ({
    month:   `${r.month} '26`,
    actual:  null,
    predicted: r.predicted,
    upper:   r.upper,
    lower:   r.lower,
  }));
  return [...last6, ...forecast];
};

// Custom tooltip for forecast chart
const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={s.tooltip}>
      <p className="body-3 mb-1" style={{ fontWeight: 600 }}>{label}</p>
      {payload.map((p) =>
        p.value !== null ? (
          <p key={p.name} className="body-3 mb-0" style={{ color: p.color }}>
            {p.name}: {p.value}°C
          </p>
        ) : null
      )}
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────
const Climate = () => {
  const selectedYear = useSelector((state) => state.filters.year);

  const yearData      = data.climateYearly[selectedYear];
  const kpis          = computeKPIs(yearData);
  const seasons       = computeSeasons(yearData);
  const comparisonData = buildComparisonData();
  const forecastData  = buildForecastData();

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-4">
        <h2 className="headline-2 mb-1">Climate</h2>
        <p className="body-3 muted">Temperature · Humidity · Precipitation — Tashkent multi-year analysis</p>
      </div>

      {/* ── Year Filter (global) ── */}
      <FiltersBar showYear />

      {/* ── KPI Cards ── */}
      <Row className="gutter mb-4">
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#FF566820" }}>
              <i className="eva eva-thermometer-outline" style={{ color: "#FF5668", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{kpis.avg}°C</p>
            <p className="body-3 muted mb-0">Annual Avg Temp</p>
            <span className="body-3 muted">{selectedYear}</span>
          </Widget>
        </Col>
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#FF8C0020" }}>
              <i className="eva eva-arrow-upward-outline" style={{ color: "#FF8C00", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{kpis.max}°C</p>
            <p className="body-3 muted mb-0">Peak Temperature</p>
            <span className="body-3 muted">July / August</span>
          </Widget>
        </Col>
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#4D53E020" }}>
              <i className="eva eva-arrow-downward-outline" style={{ color: "#4D53E0", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{kpis.min}°C</p>
            <p className="body-3 muted mb-0">Min Temperature</p>
            <span className="body-3 muted">January</span>
          </Widget>
        </Col>
        <Col xs={6} md={3}>
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#41D5E220" }}>
              <i className="eva eva-droplets-outline" style={{ color: "#41D5E2", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{kpis.avgH}%</p>
            <p className="body-3 muted mb-0">Avg Humidity</p>
            <span className="body-3 muted">{selectedYear}</span>
          </Widget>
        </Col>
      </Row>

      {/* ── Multi-Year Temperature Comparison ── */}
      <Row className="gutter mb-4">
        <Col xs={12}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">Temperature Comparison — 2023 vs 2024 vs 2025</p>
            <p className="body-3 muted mb-3">Monthly average temperature (°C) across all three years</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis unit="°C" tick={{ fontSize: 12 }} domain={[-2, 42]} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  formatter={(val) => [`${val}°C`]}
                />
                <Legend />
                {YEARS.map((y) => (
                  <Line
                    key={y}
                    type="monotone"
                    dataKey={y}
                    stroke={YEAR_COLORS[y]}
                    strokeWidth={selectedYear === y ? 3 : 1.5}
                    strokeOpacity={selectedYear === y ? 1 : 0.4}
                    dot={{ r: selectedYear === y ? 4 : 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Widget>
        </Col>
      </Row>

      {/* ── Humidity + Precipitation Chart & Seasonal Summary ── */}
      <Row className="gutter mb-4">
        <Col xs={12} lg={8} className="mb-4 mb-lg-0">
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">Humidity &amp; Precipitation — {selectedYear}</p>
            <p className="body-3 muted mb-3">Monthly humidity (%) and precipitation (mm)</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left"  tick={{ fontSize: 12 }} unit="%" />
                <YAxis yAxisId="right" tick={{ fontSize: 12 }} unit="mm" orientation="right" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Legend />
                <Bar yAxisId="left"  dataKey="humidity"      name="Humidity (%)"       fill="#41D5E2" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="precipitation" name="Precipitation (mm)"  fill="#4D53E0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </Col>

        {/* Seasonal Summary */}
        <Col xs={12} lg={4}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-1">Seasonal Summary — {selectedYear}</p>
            <p className="body-3 muted mb-3">Average temperature and total precipitation</p>
            {seasons.map((season) => (
              <div key={season.label} className="mb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{season.icon}</span>
                    <p className="body-2 mb-0 ml-2">{season.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="body-2 mb-0">{season.avg}°C</p>
                    <p className="body-3 muted mb-0">{season.rain} mm rain</p>
                  </div>
                </div>
                <hr className="mt-2 mb-0" style={{ borderColor: "#f0f0f0" }} />
              </div>
            ))}
          </Widget>
        </Col>
      </Row>

      {/* ── Temperature Forecast 2025 ── */}
      <Row className="gutter">
        <Col xs={12}>
          <Widget className="widget-p-md">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
              <div>
                <p className="headline-3 mb-0">Temperature Forecast — Jan–Jun 2026</p>
                <p className="body-3 muted mb-0">
                  Last 6 months of 2025 (actual) + 6-month forecast using ARIMA model
                </p>
              </div>
              <span className={s.forecastBadge}>ML Preview</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis unit="°C" tick={{ fontSize: 12 }} domain={[-2, 42]} />
                <Tooltip content={<ForecastTooltip />} />
                <Legend />
                {/* Divider between actual and forecast */}
                <ReferenceLine
                  x="Jan '26"
                  stroke="#ccc"
                  strokeDasharray="6 3"
                  label={{ value: "Forecast starts", fontSize: 11, fill: "#999", position: "top" }}
                />
                <Line
                  type="monotone" dataKey="actual" name="Actual"
                  stroke="#4D53E0" strokeWidth={2.5}
                  dot={{ r: 4 }} connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="predicted" name="Predicted"
                  stroke="#FF5668" strokeWidth={2} strokeDasharray="6 3"
                  dot={{ r: 4, fill: "#FF5668" }} connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="upper" name="Upper bound"
                  stroke="#FF5668" strokeWidth={1} strokeDasharray="3 3"
                  strokeOpacity={0.4} dot={false} connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="lower" name="Lower bound"
                  stroke="#FF5668" strokeWidth={1} strokeDasharray="3 3"
                  strokeOpacity={0.4} dot={false} connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Widget>
        </Col>
      </Row>
    </div>
  );
};

export default Climate;
