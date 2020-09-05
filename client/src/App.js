import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import jwtDecode from 'jwt-decode';

import "./App.css";
import home from "./Pages/home";
import login from "./Pages/login";
import signup from "./Pages/signup";
import Navbar from "./Components/Navbar";

const FBtoken = localStorage.getItem('FBtoken');
if(FBtoken){
  const data =  jwtDecode(FBtoken);
  console.log(data);
}
const themeObject = {
  palette: {
    type: "light",
    primary: {
      light: "#33c9dc",
      main: "#00bcd4",
      dark: "#008394",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff6333",
      main: "#ff3d00",
      dark: "#b22a00",
      contrastText: "#fff",
    },
  },
};


function App() {
  const [theme, setTheme] = useState(themeObject);
  const [themeChanging, setThemeChanging] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("theme") === null) {
      localStorage.setItem("theme", "light");
    } else {
      const type = localStorage.getItem("theme");
      const updatedTheme = {
        // ...theme,
        palette: {
          ...theme.palette,
          type: type === "light" ? "light" : "dark",
        },
      };
      setTheme(updatedTheme);
    }
  }, []);

  const toogleDarkMode = async () => {
    setThemeChanging(false);
    const type = localStorage.getItem('theme');
    // console.log(type);
    const newType = type === "light" ? "dark" : "light";
    const updatedTheme = {
      palette: {
        ...theme.palette,
        type: newType,
      },
    };
    localStorage.setItem("theme", newType);

    setTheme(updatedTheme);
    setThemeChanging(true);
  };

  let Muitheme = createMuiTheme(theme);
  return (
    <MuiThemeProvider theme={Muitheme}>
      <CssBaseline />
      <div className="App">
        <Router>
          <Navbar toogleDarkMode={toogleDarkMode} />
          <div className="container">
            <Switch>
              <Route exact path="/" component={home}></Route>
              <Route exact path="/login" component={login}></Route>
              <Route exact path="/signup" component={signup}></Route>
            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
