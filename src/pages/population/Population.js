import React, { useState } from "react";
import { Row, Col, Progress } from "reactstrap";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import Widget from "../../components/Widget/Widget.js";
import s from "./Population.module.scss";
import data from "../../data/environmentData.json";

// ── Constants ──────────────────────────────────────────────────────────────
const DISTRICT_COLORS = [
  "#4D53E0", "#41D5E2", "#FFC405", "#FF5668", "#3CD458", "#9B59B6",
];

// ── Helpers ────────────────────────────────────────────────────────────────

// Build combined timeline: historical + forecast
const buildGrowthData = () => {
  const hist = data.populationYearly.map((r) => ({
    year:      r.year,
    total:     r.total,
    urban:     r.urban,
    suburban:  r.suburban,
    predicted: null,
    upper:     null,
    lower:     null,
  }));
  const forecast = data.populationForecast.map((r) => ({
    year:      r.year,
    total:     null,
    urban:     null,
    suburban:  null,
    predicted: r.predicted,
    upper:     r.upper,
    lower:     r.lower,
  }));
  return [...hist, ...forecast];
};

const fmt = (n) =>
  n >= 1000000
    ? `${(n / 1000000).toFixed(2)}M`
    : `${(n / 1000).toFixed(0)}K`;

// ── Custom tooltip ─────────────────────────────────────────────────────────
const PopTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={s.tooltip}>
      <p className="body-3 mb-1" style={{ fontWeight: 600 }}>{label}</p>
      {payload.map((p) =>
        p.value !== null ? (
          <p key={p.name} className="body-3 mb-0" style={{ color: p.color }}>
            {p.name}: {fmt(p.value)}
          </p>
        ) : null
      )}
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────
const Population = () => {
  const [viewMode, setViewMode] = useState("total"); // "total" | "split"

  const latest    = data.populationYearly[data.populationYearly.length - 1];
  const prev      = data.populationYearly[data.populationYearly.length - 2];
  const yoyGrowth = (((latest.total - prev.total) / prev.total) * 100).toFixed(1);
  const urbanPct  = Math.round((latest.urban / latest.total) * 100);
  const growthData = buildGrowthData();
  const districts  = data.populationDistricts;
  const totalPop   = districts.reduce((a, d) => a + d.population, 0);

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-4">
        <h2 className="headline-2 mb-1">Population</h2>
        <p className="body-3 muted">Tashkent urban demographics · growth trends · district breakdown</p>
      </div>

      {/* ── KPI Cards ── */}
      <Row className="gutter mb-4">
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#4D53E020" }}>
              <i className="eva eva-people-outline" style={{ color: "#4D53E0", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{fmt(latest.total)}</p>
            <p className="body-3 muted mb-0">Total Population</p>
            <span className="body-3 muted">2025</span>
          </Widget>
        </Col>
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#3CD45820" }}>
              <i className="eva eva-trending-up-outline" style={{ color: "#3CD458", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">+{yoyGrowth}%</p>
            <p className="body-3 muted mb-0">YoY Growth</p>
            <span className="body-3 muted">2024 → 2025</span>
          </Widget>
        </Col>
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#41D5E220" }}>
              <i className="eva eva-home-outline" style={{ color: "#41D5E2", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{urbanPct}%</p>
            <p className="body-3 muted mb-0">Urban Share</p>
            <span className="body-3 muted">{fmt(latest.urban)} residents</span>
          </Widget>
        </Col>
        <Col xs={6} md={3}>
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#FFC40520" }}>
              <i className="eva eva-map-outline" style={{ color: "#FFC405", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">6</p>
            <p className="body-3 muted mb-0">Districts</p>
            <span className="body-3 muted">196 km² total area</span>
          </Widget>
        </Col>
      </Row>

      {/* ── Growth Chart ── */}
      <Row className="gutter mb-4">
        <Col xs={12}>
          <Widget className="widget-p-md">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
              <div>
                <p className="headline-3 mb-0">Population Growth — 2016–2025 + Forecast 2026–2028</p>
                <p className="body-3 muted mb-0">
                  Historical data (solid) with linear regression forecast (dashed)
                </p>
              </div>
              {/* View toggle */}
              <div className={s.toggleGroup}>
                <button
                  className={`${s.toggleBtn} ${viewMode === "total" ? s.active : ""}`}
                  onClick={() => setViewMode("total")}
                >
                  Total
                </button>
                <button
                  className={`${s.toggleBtn} ${viewMode === "split" ? s.active : ""}`}
                  onClick={() => setViewMode("split")}
                >
                  Urban / Suburban
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={fmt}
                  tick={{ fontSize: 12 }}
                  domain={[2300000, 3200000]}
                />
                <Tooltip content={<PopTooltip />} />
                <Legend />
                <ReferenceLine
                  x="2025"
                  stroke="#ccc"
                  strokeDasharray="6 3"
                  label={{ value: "Forecast →", fontSize: 11, fill: "#999", position: "top" }}
                />
                <Line
                  type="monotone" dataKey="total" name="Total"
                  stroke="#4D53E0" strokeWidth={2.5}
                  dot={{ r: 4 }} connectNulls={false}
                  hide={viewMode !== "total"}
                />
                <Line
                  type="monotone" dataKey="predicted" name="Forecast"
                  stroke="#FF5668" strokeWidth={2} strokeDasharray="6 3"
                  dot={{ r: 4, fill: "#FF5668" }} connectNulls={false}
                  hide={viewMode !== "total"}
                />
                <Line
                  type="monotone" dataKey="upper" name="Upper bound"
                  stroke="#FF5668" strokeWidth={1} strokeDasharray="3 3"
                  strokeOpacity={0.35} dot={false} connectNulls={false}
                  hide={viewMode !== "total"}
                />
                <Line
                  type="monotone" dataKey="lower" name="Lower bound"
                  stroke="#FF5668" strokeWidth={1} strokeDasharray="3 3"
                  strokeOpacity={0.35} dot={false} connectNulls={false}
                  hide={viewMode !== "total"}
                />
                <Line
                  type="monotone" dataKey="urban" name="Urban"
                  stroke="#4D53E0" strokeWidth={2.5}
                  dot={{ r: 4 }} connectNulls={false}
                  hide={viewMode !== "split"}
                />
                <Line
                  type="monotone" dataKey="suburban" name="Suburban"
                  stroke="#41D5E2" strokeWidth={2}
                  dot={{ r: 3 }} connectNulls={false}
                  hide={viewMode !== "split"}
                />
              </LineChart>
            </ResponsiveContainer>
          </Widget>
        </Col>
      </Row>

      {/* ── District Breakdown ── */}
      <Row className="gutter mb-4">
        {/* Bar chart by district */}
        <Col xs={12} lg={7} className="mb-4 mb-lg-0">
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">Population by District — 2025</p>
            <p className="body-3 muted mb-3">Residents per district with annual growth rate</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={districts} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val) => [fmt(val), "Population"]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="population" name="Population" radius={[4, 4, 0, 0]}>
                  {districts.map((d, i) => (
                    <rect key={d.name} fill={DISTRICT_COLORS[i % DISTRICT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </Col>

        {/* District detail table */}
        <Col xs={12} lg={5}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-1">District Details</p>
            <p className="body-3 muted mb-3">Population share, density, and growth rate</p>
            {districts.map((d, i) => {
              const share   = ((d.population / totalPop) * 100).toFixed(1);
              const density = Math.round(d.population / d.area);
              const color   = DISTRICT_COLORS[i % DISTRICT_COLORS.length];
              return (
                <div key={d.name} className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center">
                      <span className={s.districtDot} style={{ background: color }} />
                      <p className="body-2 mb-0 ml-2">{d.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="body-2 mb-0">{fmt(d.population)}</p>
                      <p className="body-3 muted mb-0">{density} / km² · +{d.growth}%/yr</p>
                    </div>
                  </div>
                  <Progress
                    value={share}
                    style={{ height: 6, borderRadius: 3, background: "#f0f0f0" }}
                    color="primary"
                    className={s.districtProgress}
                  >
                    <div
                      style={{
                        width: `${share}%`,
                        background: color,
                        height: "100%",
                        borderRadius: 3,
                      }}
                    />
                  </Progress>
                  <p className="body-3 muted mt-1 mb-0">{share}% of city total</p>
                </div>
              );
            })}
          </Widget>
        </Col>
      </Row>

      {/* ── Urban vs Suburban ratio ── */}
      <Row className="gutter">
        <Col xs={12} md={6} className="mb-4 mb-md-0">
          <Widget className="widget-p-md">
            <p className="headline-3 mb-1">Urban vs Suburban Split — 2025</p>
            <p className="body-3 muted mb-3">Proportion of population in urban and suburban zones</p>
            <div className={s.splitBar}>
              <div
                className={s.splitSegment}
                style={{ width: `${urbanPct}%`, background: "#4D53E0" }}
                title={`Urban: ${fmt(latest.urban)}`}
              />
              <div
                className={s.splitSegment}
                style={{ width: `${100 - urbanPct}%`, background: "#41D5E2" }}
                title={`Suburban: ${fmt(latest.suburban)}`}
              />
            </div>
            <div className="d-flex mt-3" style={{ gap: 24 }}>
              {[
                { label: "Urban",    value: latest.urban,    color: "#4D53E0", pct: urbanPct },
                { label: "Suburban", value: latest.suburban, color: "#41D5E2", pct: 100 - urbanPct },
              ].map((item) => (
                <div key={item.label}>
                  <div className="d-flex align-items-center mb-1" style={{ gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, display: "inline-block" }} />
                    <p className="body-3 muted mb-0">{item.label}</p>
                  </div>
                  <p className="headline-3 mb-0" style={{ color: item.color }}>{item.pct}%</p>
                  <p className="body-3 muted mb-0">{fmt(item.value)}</p>
                </div>
              ))}
            </div>
          </Widget>
        </Col>

        {/* Fastest growing districts */}
        <Col xs={12} md={6}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-1">Growth Rate by District</p>
            <p className="body-3 muted mb-3">Annual population growth rate (%)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[...districts].sort((a, b) => b.growth - a.growth)}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="%" domain={[0, 3]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Growth rate"]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="growth" name="Growth %" fill="#4D53E0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </Col>
      </Row>
    </div>
  );
};

export default Population;
