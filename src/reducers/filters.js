const initialState = {
  year:     "2025",
  district: "All Districts",
};

export default function filtersReducer(state = initialState, action) {
  switch (action.type) {
    case "FILTERS_SET_YEAR":
      return { ...state, year: action.payload };
    case "FILTERS_SET_DISTRICT":
      return { ...state, district: action.payload };
    default:
      return state;
  }
}
