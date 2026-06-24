const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { authMiddleware } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { postSchema, commentSchema } = require("../validators/schemas");

// All post routes
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Post.countDocuments();
    const posts = await Post.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json({ data: post });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authMiddleware,
  validate(postSchema),
  async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const post = new Post({ title, content, author: req.user.userId });
      await post.save();
      res.status(201).json({ data: post });
    } catch (err) {
      next(err);
    }
  },
);

router.patch("/:id", authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Comment routes
router.get("/:id/comments", authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comments = await Comment.find({ post: req.params.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ data: comments });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/comments",
  authMiddleware,
  validate(commentSchema),
  async (req, res, next) => {
    try {
      const { content } = req.body;
      const comment = new Comment({
        content,
        author: req.user.userId,
        post: req.params.id,
      });
      await comment.save();
      res.status(201).json({ data: comment });
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/:id/comments/:cid", authMiddleware, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.cid);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await Comment.findByIdAndDelete(req.params.cid);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
