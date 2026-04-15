import { combineReducers } from "redux";
import navigation from "./navigation.js";
import filters from "./filters.js";

export default combineReducers({
  navigation,
  filters,
});
