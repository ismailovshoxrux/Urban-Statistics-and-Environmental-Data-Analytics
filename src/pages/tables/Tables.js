import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import Widget from "../../components/Widget/Widget.js";
import s from "./Tables.module.scss";
import data from "../../data/environmentData.json";

// ── Tabs ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: "monthly",    label: "Monthly AQI",   icon: "eva-cloud-outline"       },
  { key: "districts",  label: "Districts",      icon: "eva-map-outline"         },
  { key: "climate",    label: "Climate 2025",   icon: "eva-thermometer-outline" },
  { key: "population", label: "Population",     icon: "eva-people-outline"      },
  { key: "ml",         label: "ML Predictions", icon: "eva-trending-up-outline" },
];

// ── Column definitions per tab ─────────────────────────────────────────────
const COLUMNS = {
  monthly: [
    { key: "month",       label: "Month"         },
    { key: "aqi",         label: "AQI"           },
    { key: "pm25",        label: "PM2.5 (µg/m³)" },
    { key: "pm10",        label: "PM10 (µg/m³)"  },
    { key: "temperature", label: "Temp (°C)"      },
    { key: "humidity",    label: "Humidity (%)"   },
  ],
  districts: [
    { key: "name",        label: "District"       },
    { key: "aqi",         label: "AQI"            },
    { key: "pm25",        label: "PM2.5 (µg/m³)"  },
    { key: "pm10",        label: "PM10 (µg/m³)"   },
    { key: "temperature", label: "Temp (°C)"       },
    { key: "population",  label: "Population"      },
  ],
  climate: [
    { key: "month",         label: "Month"            },
    { key: "temperature",   label: "Temperature (°C)" },
    { key: "humidity",      label: "Humidity (%)"     },
    { key: "precipitation", label: "Precip. (mm)"     },
  ],
  population: [
    { key: "year",     label: "Year"     },
    { key: "total",    label: "Total"    },
    { key: "urban",    label: "Urban"    },
    { key: "suburban", label: "Suburban" },
  ],
  ml: [
    { key: "month",     label: "Month"      },
    { key: "actual",    label: "Actual AQI" },
    { key: "predicted", label: "Predicted"  },
    { key: "residual",  label: "Residual"   },
    { key: "model",     label: "Model"      },
  ],
};

// ── Row builders ───────────────────────────────────────────────────────────
const buildRows = (tab, mlModel) => {
  switch (tab) {
    case "monthly":    return data.monthly;
    case "districts":  return data.districts;
    case "climate":    return data.climateYearly["2025"];
    case "population": return data.populationYearly;
    case "ml":
      return data.mlPredictions[mlModel].monthly.map((r) => ({
        ...r,
        residual: r.actual - r.predicted,
        model:    mlModel === "arima" ? "ARIMA" : "Linear Reg.",
      }));
    default: return [];
  }
};

// ── CSV export ─────────────────────────────────────────────────────────────
const exportCSV = (columns, rows, filename) => {
  const header = columns.map((c) => c.label).join(",");
  const body   = rows.map((r) =>
    columns.map((c) => (r[c.key] === null || r[c.key] === undefined ? "" : String(r[c.key]))).join(",")
  ).join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ── Helpers ────────────────────────────────────────────────────────────────
const aqiColor = (aqi) => {
  if (aqi == null) return null;
  if (aqi <= 50)  return "#41D5E2";
  if (aqi <= 100) return "#FFC405";
  if (aqi <= 150) return "#FF8C00";
  return "#FF5668";
};

const fmtCell = (key, val) => {
  if (val === null || val === undefined) return "—";
  if (["population","total","urban","suburban"].includes(key))
    return Number(val).toLocaleString();
  if (key === "residual" && val > 0) return `+${val}`;
  return String(val);
};

// ── Component ──────────────────────────────────────────────────────────────
const Tables = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [search,    setSearch]    = useState("");
  const [sortKey,   setSortKey]   = useState(null);
  const [sortAsc,   setSortAsc]   = useState(true);
  const [mlModel,   setMlModel]   = useState("arima");

  const columns = COLUMNS[activeTab];
  const allRows = buildRows(activeTab, mlModel);

  const filtered = search.trim()
    ? allRows.filter((row) =>
        columns.some((c) => {
          const v = row[c.key];
          return v != null && String(v).toLowerCase().includes(search.toLowerCase());
        })
      )
    : allRows;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number") return sortAsc ? av - bv : bv - av;
        return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      })
    : filtered;

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleTabChange = (key) => {
    setActiveTab(key); setSearch(""); setSortKey(null); setSortAsc(true);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-4">
        <h2 className="headline-2 mb-1">Data Explorer</h2>
        <p className="body-3 muted">Browse, search, sort and export the underlying dataset</p>
      </div>

      {/* ── Tabs ── */}
      <Widget className={`widget-p-md mb-4 ${s.tabBar}`}>
        <div className={s.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${s.tab} ${activeTab === t.key ? s.active : ""}`}
              onClick={() => handleTabChange(t.key)}
            >
              <i className={`eva ${t.icon}`} style={{ fontSize: 16 }} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      {/* ── Toolbar ── */}
      <Row className="gutter mb-3">
        <Col xs={12} sm={6} md={4} className="mb-2 mb-sm-0">
          <div className={s.searchBox}>
            <i className="eva eva-search-outline" style={{ color: "#9ca3af", fontSize: 18 }} />
            <input
              className={s.searchInput}
              placeholder={`Search ${TABS.find((t) => t.key === activeTab)?.label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={s.clearBtn} onClick={() => setSearch("")}>
                <i className="eva eva-close-outline" style={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </Col>

        {activeTab === "ml" && (
          <Col xs={12} sm={4} md={3} className="mb-2 mb-sm-0">
            <div className={s.mlToggle}>
              {[["arima", "ARIMA"], ["linearRegression", "Linear Reg."]].map(([key, label]) => (
                <button
                  key={key}
                  className={`${s.mlBtn} ${mlModel === key ? s.mlActive : ""}`}
                  onClick={() => setMlModel(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </Col>
        )}

        <Col className="d-flex justify-content-sm-end align-items-center">
          <span className="body-3 muted mr-3">{sorted.length} rows</span>
          <button
            className={s.exportBtn}
            onClick={() => exportCSV(columns, sorted, `tashkent_${activeTab}_2025.csv`)}
          >
            <i className="eva eva-download-outline" style={{ fontSize: 16 }} />
            &nbsp;Export CSV
          </button>
        </Col>
      </Row>

      {/* ── Table ── */}
      <Widget className="widget-p-md">
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th} style={{ width: 40 }}>#</th>
                {columns.map((col) => (
                  <th key={col.key} className={`${s.th} ${s.sortable}`} onClick={() => handleSort(col.key)}>
                    {col.label}
                    <span className={s.sortIcon}>
                      {sortKey === col.key ? (sortAsc ? " ▲" : " ▼") : " ↕"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className={s.emptyCell}>
                    No results match your search.
                  </td>
                </tr>
              ) : sorted.map((row, i) => (
                <tr key={i} className={s.tr}>
                  <td className={`${s.td} ${s.rowNum}`}>{i + 1}</td>
                  {columns.map((col) => {
                    const val   = row[col.key];
                    const color = col.key === "aqi" ? aqiColor(val) : null;
                    const isResidual = col.key === "residual";
                    return (
                      <td key={col.key} className={s.td}>
                        {color ? (
                          <span className={s.aqiBadge} style={{ background: `${color}20`, color }}>
                            {fmtCell(col.key, val)}
                          </span>
                        ) : isResidual ? (
                          <span style={{
                            fontWeight: 600,
                            color: Math.abs(val) <= 4 ? "#3CD458" : Math.abs(val) <= 8 ? "#FFC405" : "#FF5668",
                          }}>
                            {fmtCell(col.key, val)}
                          </span>
                        ) : fmtCell(col.key, val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Widget>
    </div>
  );
};

export default Tables;
