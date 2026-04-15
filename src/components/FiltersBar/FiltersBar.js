import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Widget from "../Widget/Widget.js";
import s from "./FiltersBar.module.scss";
import data from "../../data/environmentData.json";

const YEARS     = ["2023", "2024", "2025"];
const DISTRICTS = ["All Districts", ...data.districts.map((d) => d.name)];

const YEAR_COLORS = {
  "2023": "#41D5E2",
  "2024": "#FFC405",
  "2025": "#4D53E0",
};

/**
 * FiltersBar — shared Redux-connected filter bar.
 * Props:
 *   showYear     {boolean} — show year selector (default false)
 *   showDistrict {boolean} — show district selector (default false)
 */
const FiltersBar = ({ showYear = false, showDistrict = false }) => {
  const dispatch = useDispatch();
  const year     = useSelector((state) => state.filters.year);
  const district = useSelector((state) => state.filters.district);

  if (!showYear && !showDistrict) return null;

  return (
    <Widget className={`widget-p-md mb-4 ${s.bar}`}>
      <div className={s.inner}>
        <div className={s.label}>
          <i className="eva eva-options-2-outline" style={{ fontSize: 16, color: "#4D53E0" }} />
          <span className="body-3 muted ml-2">Global Filters</span>
        </div>

        <div className={s.controls}>
          {/* ── Year selector ── */}
          {showYear && (
            <div className={s.group}>
              <span className={`body-3 muted ${s.groupLabel}`}>Year</span>
              <div className={s.btnRow}>
                {YEARS.map((y) => (
                  <button
                    key={y}
                    className={`${s.filterBtn} ${year === y ? s.active : ""}`}
                    style={year === y ? { background: YEAR_COLORS[y], borderColor: YEAR_COLORS[y] } : {}}
                    onClick={() => dispatch({ type: "FILTERS_SET_YEAR", payload: y })}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          {showYear && showDistrict && <div className={s.divider} />}

          {/* ── District selector ── */}
          {showDistrict && (
            <div className={s.group}>
              <span className={`body-3 muted ${s.groupLabel}`}>District</span>
              <div className={s.btnRow}>
                {DISTRICTS.map((d) => (
                  <button
                    key={d}
                    className={`${s.filterBtn} ${district === d ? s.activeDistrict : ""}`}
                    onClick={() => dispatch({ type: "FILTERS_SET_DISTRICT", payload: d })}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
};

export default FiltersBar;
