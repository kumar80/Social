import React from "react";
import withStyles from "@material-ui/styles/withStyles";
import {Link} from "react-router-dom";

import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import { Typography } from "@material-ui/core";
import dayjs from "dayjs";
import relativeTime from  "dayjs/plugin/relativeTime";

const styles = {
    card: {
       display : 'flex',
       marginBottom : 20, 
       width : 480,
       height: 360,
    },
    image: {
        minWidth : 200,
    },
    content: {
       padding  : 25, 
       objectFit : 'cover',
    }
};

const Postcard = (props) => {
  const { classes, data } = props;
  dayjs.extend(relativeTime);
  
  return (
    <Card className={classes.card}>
      <CardMedia image={ "http://" + window.location.hostname + ':8080' +`/avatar/${data.avatar}`} title="Profile Image" className = {classes.image}/>
      <CardContent className={classes.content}>
        <Typography
          variant="h5"
          component={Link}
          to={`/user/${data.handle}`}
          color="primary"
        >
          {data.handle}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {dayjs(data.createdAt).fromNow()}
        </Typography>
        <Typography variant="body1">{data.body}</Typography>
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(Postcard);
