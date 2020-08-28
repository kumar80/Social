import React, { useState } from "react";

import withStyles from "@material-ui/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

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
  },
};

const Login = (props) => {
  const [showPassword, setShowPassword] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, errorMessage] = useState({});
  const { classes } = props;

  const handleSubmit = () => {
    const loginCredentials = {
      email: email,
      password: password,
    };
    axios
      .post("http://localhost:9999/login", loginCredentials)
      .then(async (res) => {
        //  const data = await res.json();
        console.log(res.data);
        props.history.push("/");
      })
      .catch((err) => {
        const e = {
          error: err.response.data,
        };
        errorMessage(e);
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
            helperText={errors.email}
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
            helperText={errors.password}
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
          >
            {" "}
            Login{" "}
          </Button>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  );
};

export default withStyles(styles)(Login);
