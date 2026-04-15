// -- React and related libs
import React from "react";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Redirect } from "react-router";

// -- Third Party Libs
import PropTypes from "prop-types";

// -- Custom Components
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import Breadcrumbs from "../Breadbrumbs/Breadcrumbs";

// -- Pages
import Dashboard from "../../pages/dashboard/Dashboard";
import AirQuality from "../../pages/airquality/AirQuality";
import Climate from "../../pages/climate/Climate";
import Population from "../../pages/population/Population";
import MLPredictions from "../../pages/ml/MLPredictions";
import Insights from "../../pages/insights/Insights";
import Tables from "../../pages/tables/Tables";

// -- Component Styles
import s from "./Layout.module.scss";

const Layout = (props) => {
  return (
    <div className={s.root}>
      <div className={s.wrap}>
        <Header />
        <Sidebar />
        <main className={s.content}>
          <Breadcrumbs url={props.location.pathname} />
          <Switch>
            <Route path="/template" exact render={() => <Redirect to="/template/dashboard" />} />
            <Route path="/template/dashboard"     exact component={Dashboard} />
            <Route path="/template/air-quality"   exact component={AirQuality} />
            <Route path="/template/climate"        exact component={Climate} />
            <Route path="/template/population"     exact component={Population} />
            <Route path="/template/ml-predictions" exact component={MLPredictions} />
            <Route path="/template/insights"       exact component={Insights} />
            <Route path="/template/tables"         exact component={Tables} />
            <Route path='*' exact render={() => <Redirect to="/error" />} />
          </Switch>
        </main>
        <Footer />
      </div>
    </div>
  );
};

Layout.propTypes = {
  sidebarOpened: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
  };
}

export default withRouter(connect(mapStateToProps)(Layout));
