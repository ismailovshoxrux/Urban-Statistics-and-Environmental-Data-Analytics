import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import Widget from "../../components/Widget/Widget.js";
import s from "./Insights.module.scss";
import data from "../../data/environmentData.json";

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "all",        label: "All Insights" },
  { key: "airquality", label: "Air Quality"  },
  { key: "climate",    label: "Climate"      },
  { key: "population", label: "Population"   },
  { key: "ml",         label: "ML Models"    },
];

const TYPE_META = {
  critical: { color: "#FF5668", bg: "#FF566815", label: "Critical" },
  warning:  { color: "#FFC405", bg: "#FFC40515", label: "Warning"  },
  success:  { color: "#3CD458", bg: "#3CD45815", label: "Good"     },
  info:     { color: "#4D53E0", bg: "#4D53E015", label: "Info"     },
};

// ── Correlation data: monthly temperature vs AQI ──────────────────────────
const correlationData = data.monthly.map((r) => ({
  month:       r.month,
  temperature: r.temperature,
  aqi:         r.aqi,
}));

// ── Compute summary counts ─────────────────────────────────────────────────
const countByType = (insights) =>
  insights.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});

// ── Component ──────────────────────────────────────────────────────────────
const Insights = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const allInsights = data.insights;
  const filtered    =
    activeCategory === "all"
      ? allInsights
      : allInsights.filter((i) => i.category === activeCategory);
  const counts = countByType(allInsights);

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-4">
        <h2 className="headline-2 mb-1">Insights</h2>
        <p className="body-3 muted">Auto-generated observations · anomaly alerts · data correlations</p>
      </div>

      {/* ── Summary Cards ── */}
      <Row className="gutter mb-4">
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.summaryCard}`}>
            <p className="headline-3 mb-0">{allInsights.length}</p>
            <p className="body-3 muted mb-0">Total Insights</p>
          </Widget>
        </Col>
        {[
          { type: "critical", icon: "eva-alert-triangle-outline" },
          { type: "warning",  icon: "eva-alert-circle-outline"   },
          { type: "success",  icon: "eva-checkmark-circle-2-outline" },
        ].map(({ type, icon }) => {
          const meta = TYPE_META[type];
          return (
            <Col key={type} xs={6} md={3} className="mb-3 mb-md-0">
              <Widget className={`widget-p-md ${s.summaryCard}`} style={{ borderLeft: `3px solid ${meta.color}` }}>
                <div className="d-flex align-items-center mb-1" style={{ gap: 8 }}>
                  <i className={`eva ${icon}`} style={{ color: meta.color, fontSize: 18 }} />
                  <span className={s.typeBadge} style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
                <p className="headline-3 mb-0">{counts[type] || 0}</p>
                <p className="body-3 muted mb-0">{meta.label} findings</p>
              </Widget>
            </Col>
          );
        })}
      </Row>

      {/* ── Category Filter ── */}
      <Widget className={`widget-p-md mb-4 ${s.filterWidget}`}>
        <div className={s.filterButtons}>
          {CATEGORIES.map((c) => {
            const catCount =
              c.key === "all"
                ? allInsights.length
                : allInsights.filter((i) => i.category === c.key).length;
            return (
              <button
                key={c.key}
                className={`${s.filterBtn} ${activeCategory === c.key ? s.active : ""}`}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label}
                <span className={s.filterCount}>{catCount}</span>
              </button>
            );
          })}
        </div>
      </Widget>

      {/* ── Insights Feed ── */}
      <Row className="gutter mb-4">
        <Col xs={12} lg={8} className="mb-4 mb-lg-0">
          <div className={s.insightFeed}>
            {filtered.map((insight) => {
              const meta = TYPE_META[insight.type];
              return (
                <Widget key={insight.id} className={`widget-p-md ${s.insightCard}`}>
                  <div className="d-flex align-items-flex-start" style={{ gap: 14 }}>
                    {/* Icon */}
                    <div
                      className={s.insightIcon}
                      style={{ background: meta.bg, flexShrink: 0 }}
                    >
                      <i
                        className={`eva ${insight.icon}`}
                        style={{ color: meta.color, fontSize: 20 }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex flex-wrap align-items-center mb-1" style={{ gap: 8 }}>
                        <p className="body-2 mb-0" style={{ fontWeight: 600 }}>{insight.title}</p>
                        <span
                          className={s.typeBadge}
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span className={s.catBadge}>
                          {CATEGORIES.find((c) => c.key === insight.category)?.label}
                        </span>
                      </div>
                      <p className="body-3 muted mb-2">{insight.text}</p>
                      <div className="d-flex align-items-center" style={{ gap: 12 }}>
                        <span className={s.metricPill} style={{ borderColor: meta.color, color: meta.color }}>
                          {insight.metric}
                        </span>
                        <span className="body-3 muted">{insight.district}</span>
                      </div>
                    </div>
                  </div>
                </Widget>
              );
            })}
            {filtered.length === 0 && (
              <Widget className="widget-p-md text-center">
                <p className="body-3 muted mb-0">No insights in this category.</p>
              </Widget>
            )}
          </div>
        </Col>

        {/* ── Correlation Panel ── */}
        <Col xs={12} lg={4}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">Temperature ↔ AQI Correlation</p>
            <p className="body-3 muted mb-3">
              Monthly city average — note inverse pattern (high temp → lower AQI in spring,
              high AQI in winter from heating)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left"  tick={{ fontSize: 11 }} unit="°C" domain={[0, 35]} />
                <YAxis yAxisId="right" tick={{ fontSize: 11 }} orientation="right" domain={[50, 110]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend />
                <Line
                  yAxisId="left" type="monotone" dataKey="temperature"
                  name="Temp (°C)" stroke="#FF5668" strokeWidth={2} dot={{ r: 3 }}
                />
                <Line
                  yAxisId="right" type="monotone" dataKey="aqi"
                  name="AQI" stroke="#4D53E0" strokeWidth={2} dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className={s.correlationNote}>
              <i className="eva eva-info-outline" style={{ fontSize: 14, color: "#4D53E0" }} />
              <p className="body-3 muted mb-0 ml-2">
                Pearson r ≈ −0.42 — moderate inverse correlation.
                Winter heating emissions dominate over temperature effect.
              </p>
            </div>
          </Widget>
        </Col>
      </Row>

      {/* ── District Anomaly Status ── */}
      <Row className="gutter mt-4">
        <Col xs={12}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-1">District Anomaly Status</p>
            <p className="body-3 muted mb-3">Annual average AQI vs safe threshold (≤100)</p>
            <Row>
              {data.districts.map((d) => {
                const over  = d.aqi > 100;
                const color = d.aqi > 100 ? "#FF5668" : d.aqi > 85 ? "#FFC405" : "#3CD458";
                const pct   = Math.min((d.aqi / 150) * 100, 100);
                return (
                  <Col key={d.name} xs={12} sm={6} lg={4} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <p className="body-3 mb-0">{d.name}</p>
                      <span className="body-3" style={{ color, fontWeight: 600 }}>
                        {d.aqi} {over ? "⚠" : "✓"}
                      </span>
                    </div>
                    <div className={s.aqiBar}>
                      <div
                        className={s.aqiFill}
                        style={{ width: `${pct}%`, background: color }}
                      />
                      <div className={s.aqiThreshold} />
                    </div>
                  </Col>
                );
              })}
            </Row>
            <p className="body-3 muted mt-2 mb-0">
              <span style={{ color: "#FF5668" }}>⚠</span> Above 100 &nbsp;
              <span style={{ color: "#FFC405" }}>●</span> Moderate &nbsp;
              <span style={{ color: "#3CD458" }}>✓</span> Good
            </p>
          </Widget>
        </Col>
      </Row>
    </div>
  );
};

export default Insights;
