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
import { validate as emailValidator } from "email-validator";

const styles = {
  logo: {
    width: "50px",
    margin: "20px auto 15px auto",
  },
  signupForm: {
    textAlign: "center",
  },
  signupTitle: {
    margin: "6px auto 20px auto",
  },
  signupField: {
    margin: "6px auto 20px auto",
  },
  signupButton: {
    marginTop: 20,
    marginRight: 5,
    position: "relative",
  },
  signupProgress: {
    position: "absolute",
  },
};

const validate = async ({ handle, email, password, confirmPassword }) => {
  const errors = {};

  if (handle === "") {
    errors.handle = "Handle is required";
  } else if (email === "") {
    errors.email = "Email is required";
  } else if (emailValidator(email) === false) {
    errors.email = "Enter a valid email";
  } else if (password === "") {
    errors.password = "Password is required";
  } else if (confirmPassword === "") {
    errors.confirmPassword = "Please Confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Password do not match!";
  }

  return errors;
};

const Signup = (props) => {
  const [showPassword, setShowPassword] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [handle, setHandle] = useState("");

  const [errors, errorMessage] = useState({});
  const [loading, setLoading] = useState(false);

  const { classes } = props;

  const isEmpty = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  };
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    //  console.log(errors);
    const newUser = {
      handle: handle,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };
    const errorValidating = await validate(newUser);
    if (!isEmpty(errorValidating)) {
   //   console.log(errorValidating);
      errorMessage(errorValidating);
      setLoading(false);
      return;
    }
    axios
      .post("http://localhost:8080/signup", newUser)
      .then(async (res) => {
        console.log(res.data);
        if (res.data.error) errorMessage(res.data.error);
        //props.history.push("/");
        setLoading(false);
      })
      .catch((err) => {
        const { error } = err.response.data;
        setLoading(false);
        errorMessage(error);
      });
  };

  return (
    <Grid container className={classes.signupForm}>
      <Grid item sm />
      <Grid item sm>
        <img src={logo} alt="logo" className={classes.logo} />
        <Typography variant="h3" className={classes.signupTitle}>
          SignUp
        </Typography>
        <form noValidate onSubmit={handleSubmit} method="POST">
          <TextField
            id="handle"
            name="handle"
            type="text"
            label="Handle"
            className={classes.signupField}
            variant="outlined"
            autoComplete="handle"
            error={errors.handle !== undefined ? true : false}
            helperText={errors.handle !== undefined ? errors.handle : ""}
            fullWidth
            onChange={(event) => {
              setHandle(event.target.value);
              delete errors.handle;
            }}
          />
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            className={classes.signupField}
            variant="outlined"
            autoComplete="email"
            error={errors.email !== undefined ? true : false}
            helperText={errors.email !== undefined ? errors.email : ""}
            fullWidth
            onChange={(event) => {
              setEmail(event.target.value);
              delete errors.email;
            }}
          />
          <TextField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            className={classes.signupField}
            variant="outlined"
            autoComplete="current-password"
            onChange={(event) => {
              setPassword(event.target.value);
              delete errors.password;
            }}
            error={errors.password !== undefined ? true : false}
            helperText={errors.password !== undefined ? errors.password : ""}
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
          <TextField
            id="confirmPassword"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Confirm Password"
            className={classes.signupField}
            variant="outlined"
            autoComplete="confirm-password"
            onChange={(event) => {
              setconfirmPassword(event.target.value);
              delete errors.confirmPassword;
            }}
            error={errors.confirmPassword !== undefined ? true : false}
            helperText={
              errors.confirmPassword !== undefined ? errors.confirmPassword : ""
            }
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
            className={classes.signupButton}
            disabled={loading}
          >
            Signup
            {loading && (
              <CircularProgress
                size={30}
                className={classes.signupProgress}
              ></CircularProgress>
            )}
          </Button>
          <br />
          <big>
            Already have an account? Log in{" "}
            <Link to="/login" color="primary">
              here!
            </Link>{" "}
          </big>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  );
};

export default withStyles(styles)(Signup);
