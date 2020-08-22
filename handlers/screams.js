const {
  modelScream,
  modelComment,
  modelLike,
  modelNotification,
} = require("../utility/admin.js");
const { ObjectId } = require("mongodb");

exports.createPost = (req, res) => {
  if (req.body.body === undefined)
    return res.status(400).json({ comment: "Empty Body is not allowed" });
  console.log(req.user);
  const doc = new modelScream();
  doc.body = req.body.body;
  doc.handle = req.body.handle;
  doc.commentCount = 0;
  doc.likeCount = 0;
  doc.createdAt = new Date().toISOString();
  doc.avatar = req.user.avatar;

  doc
    .save()
    .then(() => res.json(doc))
    .catch((err) => {
      console.log("!! createPost Error !! ", err);
    });
};

exports.comment = async (req, res) => {
  if (req.body.body === undefined)
    return res.status(400).json({ comment: "Empty Comment is not allowed" });

  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(400).json({ error: "Post doest not exists" });

  const newNotification = {
    _id: ObjectId(req.user.id),
    sender: req.body.handle,
    receiver: scream.handle,
    type: "comment",
  };

  const notification = new modelNotification(newNotification);
  await notification.save();

  const newComment = new modelComment();

  newComment.body = req.body.body;
  newComment.createdAt = new Date().toISOString();
  newComment.screamId = req.params.screamId;
  newComment.handle = req.user.handle;
  newComment.notificationId = notification._id;
  newComment.avatar = req.user.avatar;
  
  newComment
    .save()
    .then(() => {
      scream.commentCount = scream.commentCount + 1;
      scream.save();
      res.json(newComment);
    })
    .catch((err) => {
      console.log("!! new Comment Error !! ", err);
    });
};

exports.likeScream = async (req, res) => {
  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(400).json({ error: "Post doest not exists" });

  if (
    (await modelLike.findOne({
      handle: req.body.handle,
      screamId: req.params.screamId,
    })) !== null
  )
    return res.status(400).json({ error: "You have already liked the post" });

  const newNotification = {
    sender: req.body.handle,
    receiver: scream.handle,
    type: "like",
  };
  const notification = new modelNotification(newNotification);
  const data = await notification.save();
  const newLike = new modelLike();
  console.log(data);
  newLike.createdAt = new Date().toISOString();
  newLike.handle = req.body.handle;
  newLike.screamId = req.params.screamId;
  newLike.notificationId = notification._id;
  newLike
    .save()
    .then(() => {
      scream.likeCount = scream.likeCount + 1;
      scream.save();
      res.json(newLike);
    })
    .catch((err) => {
      console.log("!! new Like Error !! ", err);
    });
};

exports.unlikeScream = async (req, res) => {
  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(204).json({ error: "Post doest not exists" });
  const doc = await modelLike.findOne({
    handle: req.user.handle,
    screamId: req.params.screamId,
  });
  if (doc === null) return res.status(204).json({ error: "Cannot unlike" });

  await modelNotification.findOneAndDelete({
    _id: ObjectId(doc.notificationId),
  });

  modelLike
    .deleteOne({
      handle: req.body.handle,
      screamId: req.params.screamId,
    })
    .then(() => {
      scream.likeCount = scream.likeCount - 1;
      scream.save();
      res.status(200).json("Unliked");
    })
    .catch((err) => {
      console.log("!! unlike Error !!", err);
      res.status(500).json({error : "unknown error"});
    });
};

exports.deleteComment = async (req, res) => {
  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(204).json({ error: "Post doest not exists" });
  const doc = await modelComment.findOne({
    handle: req.user.handle,
    screamId: req.params.screamId,
  });
  if (doc === null) return res.status(204).json({ error: "Cannot unlike" });

  await modelNotification.findOneAndDelete({
    _id: ObjectId(doc.notificationId),
  });
  
  modelComment
    .deleteOne({
      handle: req.user.handle,
      screamId: req.params.screamId,
    })
    .then(() => {
      scream.commentCount = scream.commentCount - 1;
      scream.save();
      res.status(200).json("Comment Deleted");
    })
    .catch((err) => {
      console.log("!! Comment Delete Error !!", err);
      res.status(500).json({error : "unknown error"});
    });
};

exports.deleteScream = async (req, res) => {
  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(204).json({ error: "Post doest not exists" });
  if(scream.handle!==req.user.handle) 
    return res.status(401).json({ error: "You can Delete only your Posts" });

  scream.delete();

  const d1 = await modelLike.deleteMany({ screamId: req.params.screamId });
  const d2 = await modelComment.deleteMany({ screamId: req.params.screamId });

  if (d1.ok == 1 && d2.ok == 1) return res.status(200).json("Post Deleted");

  return res.status(500).json({ error: "Error Deleting" });
};

exports.feed = (req, res) => {
  modelScream
    .find({})
    .sort({ createdAt: "desc" })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.log(err);
      res.json({ error: "error fetching posts" });
    });
};

exports.getScream = async (req, res) => {
  let screamData = {};
  modelScream
    .findById(ObjectId(req.params.screamId))
    .then((scream) => {
      if (scream === null) return res.json({ error: "Post does not exists " });
      screamData.scream = scream;
      screamData.comments = [];
      modelComment
        .find({ screamId: req.params.screamId })
        .sort({ createdAt: "desc" })
        .then((doc) => {
          console.log(doc);
          doc.forEach((d) => screamData.comments.push(d));
        })
        .then(() => res.json(screamData))
        .catch((err) => {
          console.log("getScreamComments", err);
          return res.json(err);
        });
    })
    .catch((err) => {
      console.log("getScream", err);
      return res.json(err);
    });
};
