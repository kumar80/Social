import React, { Component } from "react";
import {Link} from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

const Navbar = (props) => {
  return (
    <AppBar position="fixed">
      <Toolbar className="toolbar-container">
        <Button color="inherit" component={Link} to="/">
          HOME
        </Button>
        <Button color="inherit" component={Link} to="/login">
          LOGIN
        </Button>
        <Button color="inherit" component={Link} to="/signup">
          SIGNUP
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
