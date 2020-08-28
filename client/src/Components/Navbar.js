import React, { Component } from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import { Switch as Toogle, FormControlLabel } from "@material-ui/core";

import styles from "./Navbar.module.css";


const Navbar = (props) => {
  const { toogleDarkMode } = props;

  return (
    <AppBar position="fixed">
      <Toolbar className="toolbar-container">
        <Button color="inherit" component={Link} to="/">
          HOME
        </Button>
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
        <FormControlLabel control={<Toogle onClick={toogleDarkMode} />} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
