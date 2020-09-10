import React from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import { Switch as Toogle, FormControlLabel } from "@material-ui/core";
import NotificationsIcon from '@material-ui/icons/Notifications';
import styles from "./Navbar.module.css";
import HomeIcon from '@material-ui/icons/Home';
const Navbar = (props) => {
  const { toogleDarkMode } = props;

  return (
    <AppBar position="fixed">
      <Toolbar className="toolbar-container">
        <Button color="inherit" component={Link} to="/">
        <HomeIcon/>
        </Button>
        <NotificationsIcon />
        <Button color="inherit" component={Link} to="/login">
          LOGIN
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/signup"
          style={{ margin: "10px" }}
        >
          SIGNUP
        </Button>
        <FormControlLabel
          control={
            <Toogle
              onClick={toogleDarkMode}
              checked={localStorage.getItem("theme") === "dark" ? true : false}
            />
          }
        />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
