import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import axios from "axios";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/styles/withStyles";
import Fab from "@material-ui/core/Fab";
import CancelIcon from "@material-ui/icons/Cancel";
import Postcard from "../Components/Postcard";
import { set } from "mongoose";

const styles = {
  button: {
    marginTop: 20,
    marginRight: 5,
    position: "relative",
    textTransform: "none",
  },
  taginput: {
    marginLeft: 10,
    position: "relative",
    width: 250,
  },
  messageinput: {
    marginTop: 10,
  },
};

const Home = (props) => {
  const [posts, setPosts] = useState([]);
  const { classes } = props;
  const [tags, setTags] = useState([]);
  const [x, setx] = useState();

  useEffect(() => {
    axios
      .get("http://localhost:8080/feed")
      .then(async (res) => {
        let postdata = res.data;
        setPosts(postdata);
        // console.log(postdata)
      })
      .catch((err) => {
        console.log("Error Fetching feed", err);
      });
  }, []);

  const handleSubmit = (e) => {
    let p = new FormData(e.target);
    e.preventDefault();
    axios
      .post("http://localhost:8080/broadcast", {
        message: p.get("message"),
        tags: tags,
      })
      .then((res) => {
        let status = res.data;
        //console.log(status)
      })
      .catch((err) => {
        console.log("Error Broadcasting", err);
      });
  };

  const renderTags = () => {
    if (!tags.length) return setx(<div></div>);

    const d = tags.map((tag, i) => (
      <Fab variant="extended" size="small" key={i}>
        {tag}
        <CancelIcon
          key={i}
          onClick={() => {
            removeTag(i);
          }}
        />
      </Fab>
    ));
    setx(d);
  };

  const inputKeyDown = (e) => {
    const val = e.target.value;
    if (e.key === "Enter" && val) {
      if (tags.find((tag) => tag === val)) return;

      let newTags = tags;
      newTags.push(val);
      setTags(newTags);
      e.target.value = "";
    } else if (e.key === "Backspace" && !val) {
      let newTags = tags;
      newTags.pop();
      setTags(newTags);
    }

    renderTags();
  };

  const removeTag = (i) => {
    const newTags = tags;
    newTags.splice(i, 1);
    setTags(newTags);
    renderTags();
    console.log(newTags);
  };

  let feedData;
  if (posts.length !== 0) {
    feedData = posts.map((p, index) => <Postcard key={index} data={p} />);
  } else {
    feedData = <p key="0">Loading...</p>;
  }

  return (
    <div>
      <div className={classes.messageinput}>
        <form id="formB" onSubmit={handleSubmit} method="POST">
          <TextField
            id="message"
            name="message"
            label="Enter Message"
            variant="outlined"
            fullWidth
          />
          <ul>
            {x}
            <TextField
              id="addTag"
              name="addTag"
              type="text"
              label="Enter Tag and Press Enter"
              onKeyDown={inputKeyDown}
              className={classes.taginput}
            ></TextField>
          </ul>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Broadcast Message
          </Button>
        </form>
      </div>
      <Grid container spacing={10}>
        <Grid item sm={8} xs={12} key="4">
          {feedData}
        </Grid>
        <Grid item sm={4} xs={12} key="7">
          <p>...BBBBB</p>
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(Home);
