import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import { Switch as Toogle, FormControlLabel } from "@material-ui/core";
import NotificationsIcon from "@material-ui/icons/Notifications";
import HomeIcon from "@material-ui/icons/Home";
import axios from "axios";
import CustomizedMenus from "./StyledMenu";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  button: {
    ariaControls: "customized-menu",
    ariaHaspopup: "true",
    variant: "contained",
    color: "primary",
  },
  toolbarContainer: {
    marginLeft : 860,
  },
};

const Navbar = (props) => {
  const [showNotification, setShowNotification] = useState(false);
  const { classes } = props;
  const { toogleDarkMode } = props;
  const [notificationList, setNotificationList] = useState([]);
  const notificationClick = (e) => {
    // e.preventDefault();
    axios
      .get("http://localhost:8080/notifications")
      .then(async (res) => {
        let postdata = res.data.notifications;
        console.log(postdata);
        const d = postdata.map((d, i) => {
          if (d.type === "broadcast") {
            return {
              message: ` ${d.sender} has sent you a broadcast! `,
              id: postdata._id,
            };
          }
          if (d.type === "like") {
            return {
              message: ` ${d.sender} has liked your post `,
              id: postdata._id,
            };
          }
          if (d.type === "comment") {
            return {
              message: ` ${d.sender} has commented your post `,
              id: postdata._id,
            };
          }
        });
        setNotificationList(d);
      })
      .catch((err) => {
        console.log("Error Fetching notifications", err);
      });
  };
  return (
    <AppBar position="fixed">
      <Toolbar className={classes.toolbarContainer}>
        <Button
          style={{ margin: "10px" }}
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          component={Link}
          to="/"
        >
          <HomeIcon />
        </Button>
        <Button style={{ margin: "10px" }} onClick={notificationClick}>
          <CustomizedMenus data={notificationList} />
        </Button>
        <Button
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          component={Link}
          to="/login"
          style={{ margin: "10px" }}
        >
          LOGIN
        </Button>
        <Button
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
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

export default withStyles(styles)(Navbar);
