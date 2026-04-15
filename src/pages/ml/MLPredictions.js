import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import Widget from "../../components/Widget/Widget.js";
import s from "./MLPredictions.module.scss";
import data from "../../data/environmentData.json";

// ── Constants ──────────────────────────────────────────────────────────────
const MODELS = [
  { key: "linearRegression", label: "Linear Regression" },
  { key: "arima",            label: "ARIMA" },
];

const MODEL_COLOR = "#4D53E0";
const ACTUAL_COLOR = "#41D5E2";
const FORECAST_COLOR = "#FF5668";

// ── Helpers ────────────────────────────────────────────────────────────────

// Merge actual 2025 months + forecast months into one timeline
const buildForecastData = (modelData) => {
  const actual = modelData.monthly.map((r) => ({
    month:     r.month,
    actual:    r.actual,
    predicted: r.predicted,
    forecast:  null,
    upper:     null,
    lower:     null,
  }));
  const forecast = modelData.forecast.map((r) => ({
    month:     r.month,
    actual:    null,
    predicted: null,
    forecast:  r.predicted,
    upper:     r.upper,
    lower:     r.lower,
  }));
  return [...actual, ...forecast];
};

// Custom tooltip
const PredTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={s.tooltip}>
      <p className="body-3 mb-1" style={{ fontWeight: 600 }}>{label}</p>
      {payload.map((p) =>
        p.value !== null ? (
          <p key={p.name} className="body-3 mb-0" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ) : null
      )}
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────
const MLPredictions = () => {
  const [selectedModel, setSelectedModel] = useState("arima");

  const modelData    = data.mlPredictions[selectedModel];
  const { metrics }  = modelData;
  const chartData    = buildForecastData(modelData);
  const features     = modelData.featureImportance;
  const maxImportance = Math.max(...features.map((f) => f.importance));

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-4">
        <h2 className="headline-2 mb-1">ML Predictions</h2>
        <p className="body-3 muted">AQI forecast — actual vs predicted · model accuracy · feature importance</p>
      </div>

      {/* ── Model Selector ── */}
      <Widget className={`widget-p-md mb-4 ${s.filterWidget}`}>
        <p className="body-3 muted mb-2">Select prediction model:</p>
        <div className={s.filterButtons}>
          {MODELS.map((m) => (
            <button
              key={m.key}
              className={`${s.filterBtn} ${selectedModel === m.key ? s.active : ""}`}
              onClick={() => setSelectedModel(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Widget>

      {/* ── Metrics Cards ── */}
      <Row className="gutter mb-4">
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.metricCard}`}>
            <div className={s.metricIcon} style={{ background: "#4D53E020" }}>
              <i className="eva eva-activity-outline" style={{ color: MODEL_COLOR, fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{metrics.mae}</p>
            <p className="body-2 mb-0">MAE</p>
            <p className="body-3 muted mb-0">Mean Absolute Error (AQI units)</p>
          </Widget>
        </Col>
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.metricCard}`}>
            <div className={s.metricIcon} style={{ background: "#FFC40520" }}>
              <i className="eva eva-bar-chart-outline" style={{ color: "#FFC405", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{metrics.rmse}</p>
            <p className="body-2 mb-0">RMSE</p>
            <p className="body-3 muted mb-0">Root Mean Squared Error</p>
          </Widget>
        </Col>
        <Col xs={12} md={4}>
          <Widget className={`widget-p-md ${s.metricCard}`}>
            <div className={s.metricIcon} style={{ background: "#3CD45820" }}>
              <i className="eva eva-checkmark-circle-2-outline" style={{ color: "#3CD458", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{metrics.r2}</p>
            <p className="body-2 mb-0">R² Score</p>
            <p className="body-3 muted mb-0">Coefficient of determination</p>
          </Widget>
        </Col>
      </Row>

      {/* ── Actual vs Predicted + Forecast Chart ── */}
      <Row className="gutter mb-4">
        <Col xs={12}>
          <Widget className="widget-p-md">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
              <div>
                <p className="headline-3 mb-0">AQI — Actual vs Predicted (2025) + Forecast (Jan–Jun 2026)</p>
                <p className="body-3 muted mb-0">
                  Monthly AQI values with {selectedModel === "arima" ? "ARIMA" : "Linear Regression"} model output and 6-month forecast
                </p>
              </div>
              <span className={s.modelBadge}>
                {selectedModel === "arima" ? "ARIMA" : "Linear Reg."}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[40, 120]} tick={{ fontSize: 12 }} />
                <Tooltip content={<PredTooltip />} />
                <Legend />
                <ReferenceLine
                  x="Jan '26"
                  stroke="#ccc"
                  strokeDasharray="6 3"
                  label={{ value: "Forecast →", fontSize: 11, fill: "#999", position: "top" }}
                />
                <ReferenceLine y={100} stroke="#FFC405" strokeDasharray="4 2" strokeOpacity={0.6} />
                <Line
                  type="monotone" dataKey="actual" name="Actual"
                  stroke={ACTUAL_COLOR} strokeWidth={2.5}
                  dot={{ r: 4 }} connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="predicted" name="Predicted"
                  stroke={MODEL_COLOR} strokeWidth={2} strokeDasharray="5 3"
                  dot={{ r: 3 }} connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="forecast" name="Forecast"
                  stroke={FORECAST_COLOR} strokeWidth={2} strokeDasharray="6 3"
                  dot={{ r: 4, fill: FORECAST_COLOR }} connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="upper" name="Upper bound"
                  stroke={FORECAST_COLOR} strokeWidth={1} strokeDasharray="3 3"
                  strokeOpacity={0.35} dot={false} connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="lower" name="Lower bound"
                  stroke={FORECAST_COLOR} strokeWidth={1} strokeDasharray="3 3"
                  strokeOpacity={0.35} dot={false} connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Widget>
        </Col>
      </Row>

      {/* ── Feature Importance + Residuals ── */}
      <Row className="gutter mb-4">
        {/* Feature importance bar chart */}
        <Col xs={12} lg={7} className="mb-4 mb-lg-0">
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">Feature Importance</p>
            <p className="body-3 muted mb-3">Relative contribution of each input variable to AQI prediction</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={features}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="%" domain={[0, 50]} />
                <YAxis type="category" dataKey="feature" tick={{ fontSize: 12 }} width={160} />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Importance"]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="importance" name="Importance" fill={MODEL_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </Col>

        {/* Error summary panel */}
        <Col xs={12} lg={5}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-1">Residuals — 2025</p>
            <p className="body-3 muted mb-3">Difference between actual and predicted AQI per month</p>
            <div className={s.residualList}>
              {modelData.monthly.map((r) => {
                const diff  = r.actual - r.predicted;
                const abs   = Math.abs(diff);
                const color = abs <= 4 ? "#3CD458" : abs <= 8 ? "#FFC405" : "#FF5668";
                return (
                  <div key={r.month} className={s.residualRow}>
                    <span className="body-3" style={{ width: 36, flexShrink: 0 }}>{r.month}</span>
                    <div className={s.residualBar}>
                      <div
                        className={s.residualFill}
                        style={{
                          width: `${(abs / 15) * 100}%`,
                          background: color,
                          marginLeft: diff < 0 ? "auto" : 0,
                        }}
                      />
                    </div>
                    <span className="body-3" style={{ width: 36, textAlign: "right", color, flexShrink: 0 }}>
                      {diff > 0 ? "+" : ""}{diff}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="d-flex mt-3" style={{ gap: 16 }}>
              {[["#3CD458", "≤ 4 (Good)"], ["#FFC405", "≤ 8 (Fair)"], ["#FF5668", "> 8 (High)"]].map(([c, label]) => (
                <div key={label} className="d-flex align-items-center" style={{ gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                  <span className="body-3 muted">{label}</span>
                </div>
              ))}
            </div>
          </Widget>
        </Col>
      </Row>

      {/* ── Model Info Banner ── */}
      <Row className="gutter">
        <Col xs={12}>
          <Widget className={`widget-p-md ${s.infoBanner}`}>
            <i className="eva eva-info-outline" style={{ fontSize: 20, color: MODEL_COLOR, flexShrink: 0 }} />
            <p className="body-3 mb-0 ml-3">
              {selectedModel === "arima"
                ? "ARIMA (Autoregressive Integrated Moving Average) captures temporal dependencies and seasonality in the AQI time series. Parameters: p=2, d=1, q=1. Trained on 2023–2025 monthly data."
                : "Linear Regression models AQI as a linear combination of environmental features (temperature, humidity, wind speed, season, population). Trained on 2023–2025 monthly data with 5-fold cross-validation."
              }
            </p>
          </Widget>
        </Col>
      </Row>
    </div>
  );
};

export default MLPredictions;
