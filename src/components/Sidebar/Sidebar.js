import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import s from "./Sidebar.module.scss";
import LinksGroup from "./LinksGroup/LinksGroup.js";
import { changeActiveSidebarItem } from "../../actions/navigation.js";
import SofiaLogo from "../Icons/SofiaLogo.js";
import cn from "classnames";

const Sidebar = (props) => {

  const [burgerSidebarOpen, setBurgerSidebarOpen] = useState(false);

  useEffect(() => {
    if (props.sidebarOpened) {
      setBurgerSidebarOpen(true);
    } else {
      setTimeout(() => {
        setBurgerSidebarOpen(false);
      }, 0);
    }
  }, [props.sidebarOpened]);

  return (
    <nav className={cn(s.root, { [s.sidebarOpen]: burgerSidebarOpen })}>
      <header className={s.logo}>
        <SofiaLogo />
        <span className={s.title}>Urban Analytics</span>
      </header>
      <ul className={s.nav}>

        {/* --- OVERVIEW --- */}
        <LinksGroup
          onActiveSidebarItemChange={activeItem => props.dispatch(changeActiveSidebarItem(activeItem))}
          activeItem={props.activeItem}
          header="Dashboard"
          isHeader
          iconName={<i className={'eva eva-home-outline'} />}
          link="/template/dashboard"
          index="dashboard"
        />

        {/* --- ANALYTICS --- */}
        <h5 className={s.navTitle}>ANALYTICS</h5>
        <LinksGroup
          onActiveSidebarItemChange={activeItem => props.dispatch(changeActiveSidebarItem(activeItem))}
          activeItem={props.activeItem}
          header="Air Quality"
          isHeader
          iconName={<i className={'eva eva-cloud-outline'} />}
          link="/template/air-quality"
          index="air-quality"
        />
        <LinksGroup
          onActiveSidebarItemChange={activeItem => props.dispatch(changeActiveSidebarItem(activeItem))}
          activeItem={props.activeItem}
          header="Climate"
          isHeader
          iconName={<i className={'eva eva-thermometer-outline'} />}
          link="/template/climate"
          index="climate"
        />
        <LinksGroup
          onActiveSidebarItemChange={activeItem => props.dispatch(changeActiveSidebarItem(activeItem))}
          activeItem={props.activeItem}
          header="Population"
          isHeader
          iconName={<i className={'eva eva-people-outline'} />}
          link="/template/population"
          index="population"
        />

        {/* --- MACHINE LEARNING --- */}
        <h5 className={s.navTitle}>MACHINE LEARNING</h5>
        <LinksGroup
          onActiveSidebarItemChange={activeItem => props.dispatch(changeActiveSidebarItem(activeItem))}
          activeItem={props.activeItem}
          header="ML Predictions"
          isHeader
          iconName={<i className={'eva eva-trending-up-outline'} />}
          link="/template/ml-predictions"
          index="ml-predictions"
        />
        <LinksGroup
          onActiveSidebarItemChange={activeItem => props.dispatch(changeActiveSidebarItem(activeItem))}
          activeItem={props.activeItem}
          header="Insights"
          isHeader
          iconName={<i className={'eva eva-bulb-outline'} />}
          link="/template/insights"
          index="insights"
        />

        {/* --- DATA --- */}
        <h5 className={s.navTitle}>DATA</h5>
        <LinksGroup
          onActiveSidebarItemChange={activeItem => props.dispatch(changeActiveSidebarItem(activeItem))}
          activeItem={props.activeItem}
          header="Data Explorer"
          isHeader
          iconName={<i className={'eva eva-grid-outline'} />}
          link="/template/tables"
          index="tables"
        />

      </ul>
    </nav>
  );
};

Sidebar.propTypes = {
  sidebarOpened: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  activeItem: PropTypes.string,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    activeItem: store.navigation.activeItem,
  };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
