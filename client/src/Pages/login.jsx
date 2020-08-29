import React, { useState } from "react";

import { Link } from "react-router-dom";

import withStyles from "@material-ui/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import CircularProgress from "@material-ui/core/CircularProgress";

import axios from "axios";

import logo from "../assets/logo.png";

const styles = {
  logo: {
    width: "50px",
    margin: "20px auto 15px auto",
  },
  loginForm: {
    textAlign: "center",
  },
  loginTitle: {
    margin: "6px auto 20px auto",
  },
  loginField: {
    margin: "6px auto 20px auto",
  },
  loginButton: {
    marginTop: 20,
    marginRight: 5,
    position: "relative",
  },
  loginProgress:{
    position: "absolute",
  }
};

const Login = (props) => {
  const [showPassword, setShowPassword] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, errorMessage] = useState({});
  const [loading, setLoading] = useState(false);

  const { classes } = props;

  const handleSubmit = (e) => {
    e.preventDefault();
    //  console.log(errors);
    setLoading(true);
    const loginCredentials = {
      email: email,
      password: password,
    };
    axios
      .post("http://localhost:8080/login", loginCredentials)
      .then(async (res) => {
        setLoading(false)
        console.log(res.data);
        if (res.data.error) errorMessage(res.data.error);
        //props.history.push("/");
      })
      .catch((err) => {
        const { error } = err.response.data;
        setLoading(false);
        errorMessage(error);
      });
  };

  return (
    <Grid container className={classes.loginForm}>
      <Grid item sm />
      <Grid item sm>
        <img src={logo} alt="logo" className={classes.logo} />
        <Typography variant="h3" className={classes.loginTitle}>
          Login
        </Typography>
        <form noValidate onSubmit={handleSubmit} method="POST">
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            className={classes.loginField}
            variant="outlined"
            autoComplete="username"
            error={errors.type === "email" ? true : false}
            helperText={errors.type === "email" ? errors.message : ""}
            fullWidth
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            className={classes.loginField}
            variant="outlined"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            error={errors.type === "password" ? true : false}
            helperText={errors.type === "password" ? errors.message : ""}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment>
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() =>
                      showPassword ? setShowPassword(0) : setShowPassword(1)
                    }
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.loginButton}
            disabled={loading}
          >
            Login
            {loading && (
              <CircularProgress size={30}
                className={classes.loginProgress}
              ></CircularProgress>
            )}
          </Button>
          <br />
          <small>
            Don't Have an account? Sign up{" "}
            <Link to="/signup" color="primary">
              here!
            </Link>{" "}
          </small>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  );
};

export default withStyles(styles)(Login);
