import React from "react";
import { Switch, Route, Redirect } from "react-router";
import { HashRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LayoutComponent from "./components/Layout/Layout";
import ErrorPage from "./pages/error/ErrorPage";

import "./styles/app.scss";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <HashRouter>
        <Switch>
          <Route path="/" exact render={() => <Redirect to="/template/dashboard" />} />
          <Route path="/template" component={LayoutComponent} />
          <Route path="/error" exact component={ErrorPage} />
          <Route render={() => <Redirect to="/error" />} />
        </Switch>
      </HashRouter>
    </div>
  );
};

export default App;
