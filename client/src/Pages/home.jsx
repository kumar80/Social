import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import axios from "axios";

import Postcard from  "../Components/Postcard"

const Home = (props) => {
  const [posts, setPosts] = useState([]);

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

  let feedData;
  if (posts.length !== 0) 
  {
    feedData = posts.map((p,index) => <Postcard key={index} data={p}/>);
  }
  else {
    feedData = <p key ='0'>Loading...</p>
  }

  return (
    <Grid container spacing={10}>
      <Grid item sm={8} xs={12} key='4'>
        {feedData}
      </Grid>
      <Grid item sm={4} xs={12} key='7'>
        <p>...BBBBB</p>
      </Grid>
    </Grid>
  );
};

export default Home;
