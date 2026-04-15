import React from "react";
import { useLiveAQI } from "../../hooks/useLiveAQI";
import { Col, Row, Progress } from "reactstrap";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Widget from "../../components/Widget/Widget.js";
import s from "./Dashboard.module.scss";
import data from "../../data/environmentData.json";

// AQI thresholds → label + color
const getAQIStatus = (aqi) => {
  if (aqi <= 50)  return { label: "Good",       color: "#41D5E2", progress: "secondary-cyan" };
  if (aqi <= 100) return { label: "Moderate",   color: "#FFC405", progress: "secondary-yellow" };
  if (aqi <= 150) return { label: "Sensitive",  color: "#FF8C00", progress: "secondary-red" };
  return           { label: "Unhealthy",         color: "#FF5668", progress: "secondary-red" };
};

const Dashboard = () => {
  const { summary, monthly, districts, insights } = data;
  const { data: liveAQI, loading: liveLoading } = useLiveAQI("tashkent");

  const displayAQI  = liveAQI ? liveAQI.aqi : summary.avgAQI;
  const updatedTime = liveAQI?.updatedAt
    ? liveAQI.updatedAt.slice(11, 16)  // "HH:MM" from "YYYY-MM-DD HH:MM:SS"
    : null;

  return (
    <div>
      {/* Page header */}
      <div className="mb-4">
        <h2 className="headline-2 mb-1">Urban Analytics Dashboard</h2>
        <p className="body-3 muted">Tashkent City — Environmental &amp; Urban Data Overview · 2025</p>
      </div>

      {/* ── KPI Summary Cards ── */}
      <Row className="gutter mb-4">
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className="d-flex align-items-center justify-content-between">
              <div className={s.kpiIcon} style={{ background: "#FFC40520" }}>
                <i className="eva eva-cloud-outline" style={{ color: "#FFC405", fontSize: 22 }} />
              </div>
              {liveLoading && (
                <span className={s.liveBadge} style={{ background: "#f0f0f0", color: "#999" }}>
                  ···
                </span>
              )}
              {liveAQI && (
                <span className={s.liveBadge}>
                  ● LIVE
                </span>
              )}
            </div>
            <p className="headline-3 mt-2 mb-0">{displayAQI}</p>
            <p className="body-3 muted mb-1">Current AQI</p>
            {updatedTime
              ? <span className={s.liveTime}>Updated {updatedTime}</span>
              : <span className={s.trendUp}>↑ +5% this month</span>
            }
          </Widget>
        </Col>
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#FF566820" }}>
              <i className="eva eva-thermometer-outline" style={{ color: "#FF5668", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{summary.avgTemperature}°C</p>
            <p className="body-3 muted mb-1">Avg Temperature</p>
            <span className={s.trendUp}>↑ +2.1° above norm</span>
          </Widget>
        </Col>
        <Col xs={6} md={3} className="mb-3 mb-md-0">
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#41D5E220" }}>
              <i className="eva eva-people-outline" style={{ color: "#41D5E2", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{(summary.population / 1000000).toFixed(2)}M</p>
            <p className="body-3 muted mb-1">Population</p>
            <span className={s.trendUp}>↑ +1.4% annual growth</span>
          </Widget>
        </Col>
        <Col xs={6} md={3}>
          <Widget className={`widget-p-md ${s.kpiCard}`}>
            <div className={s.kpiIcon} style={{ background: "#4D53E020" }}>
              <i className="eva eva-activity-outline" style={{ color: "#4D53E0", fontSize: 22 }} />
            </div>
            <p className="headline-3 mt-2 mb-0">{summary.avgPM25} µg/m³</p>
            <p className="body-3 muted mb-1">Avg PM2.5</p>
            <span className={s.trendDown}>↓ −3% vs last month</span>
          </Widget>
        </Col>
      </Row>

      {/* ── AQI Trend Chart + Quick Insights ── */}
      <Row className="gutter mb-4">
        <Col xs={12} lg={8} className="mb-4 mb-lg-0">
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">AQI &amp; PM2.5 Trend — 2025</p>
            <p className="body-3 muted mb-3">Monthly averages across all districts</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone" dataKey="aqi" name="AQI"
                  stroke="#4D53E0" strokeWidth={2} dot={{ r: 3 }}
                />
                <Line
                  type="monotone" dataKey="pm25" name="PM2.5"
                  stroke="#FF5668" strokeWidth={2} dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Widget>
        </Col>

        <Col xs={12} lg={4}>
          <Widget className={`widget-p-md ${s.insightsWidget}`}>
            <p className="headline-3 mb-0">Quick Insights</p>
            <p className="body-3 muted mb-3">Auto-generated from current data</p>
            {insights.slice(0, 4).map((item) => {
              const icon =
                item.type === "critical" ? "eva-alert-triangle-outline" :
                item.type === "warning"  ? "eva-alert-circle-outline"   :
                item.type === "success"  ? "eva-checkmark-circle-outline" :
                "eva-info-outline";
              const typeClass = item.type === "critical" ? "warning" : item.type;
              return (
                <div key={item.id} className={`${s.insightItem} ${s[typeClass]}`}>
                  <i className={`eva mr-2 ${icon}`} />
                  <p className="body-3 mb-0">{item.title}</p>
                </div>
              );
            })}
          </Widget>
        </Col>
      </Row>

      {/* ── District Comparison Chart + Status ── */}
      <Row className="gutter">
        <Col xs={12} lg={8} className="mb-4 mb-lg-0">
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">District Air Quality Comparison</p>
            <p className="body-3 muted mb-3">Current AQI and PM2.5 levels by district</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={districts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="aqi"  name="AQI"   fill="#4D53E0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pm25" name="PM2.5" fill="#41D5E2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </Col>

        <Col xs={12} lg={4}>
          <Widget className="widget-p-md">
            <p className="headline-3 mb-0">District Status</p>
            <p className="body-3 muted mb-3">Current AQI risk level per district</p>
            {districts.map((d) => {
              const status = getAQIStatus(d.aqi);
              const pct = Math.min(Math.round((d.aqi / 200) * 100), 100);
              return (
                <div key={d.name} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <p className="body-3 mb-0">{d.name}</p>
                    <p className="body-3 mb-0" style={{ color: status.color }}>
                      {d.aqi} — {status.label}
                    </p>
                  </div>
                  <Progress
                    color={status.progress}
                    className="progress-xs"
                    value={pct}
                  />
                </div>
              );
            })}
          </Widget>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
