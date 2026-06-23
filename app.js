require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const User = require("./user");
const Post = require("./post");
const Comment = require("./comments");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

app.use(express.json());

const MONGODB_SECRET_URL = process.env.MONGODB_SECRET_URL;
const SECRET = process.env.SECRET;
const PORT = process.env.PORT_MAIN;

mongoose
  .connect(MONGODB_SECRET_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to server", err));

//Helpers

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({
      error: "No authorization",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized user, please check credentials",
    });
  }
};

const requireAdmin = (req, res, next) => {
  const role = req.user.role;
  if (role != "admin") {
    return res.status(403).json({
      error: "User is unauthorized",
    });
  }
  next();
};

app.get("/health", (req, res) => {
  return res.status(200).send("OK");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const roles = ["admin", "viewer", "guest"];
    if (!username || !password) {
      return res.status(400).json({
        error: "Both username and password is required",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        error: "Password needs to be at least 8 characters",
      });
    }
    if (role && !roles.includes(role)) {
      return res.status(400).json({
        error: "the role select is not part of the current roles available ",
      });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: `user ${username} already exists, user a different name}`,
      });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashpassword,
      role,
    });
    await newUser.save();

    return res.status(201).json({
      data: newUser,
    });
  } catch (err) {
    return res.status(400).json({
      error: "Username already exists",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        error: "Invalid User Please check the user information entered",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid user password please fix the password used",
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      SECRET,
      {
        expiresIn: "1h",
      },
    );
    res.status(200).json({
      message: `Welcome ${user.username} you are a ${user.role}`,
      token,
    });
  } catch (err) {
    return res.status(400).json({
      error: "Something went wrong",
    });
  }
});
app.get("/api/v1/posts", authMiddleware, async (req, res) => {
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
        totalPage: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.get("/api/v1/posts/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(204).json({
        error: "Content Unavailable",
      });
    }
    res.status(200).json({
      data: post,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.post("/api/v1/posts", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        error: "Missing Title or Content",
      });
    }

    const post = new Post({
      title,
      content,
      author: req.user.userId,
    });
    await post.save();
    res.status(201).json({
      data: post,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.patch("/api/v1/posts/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(204).json({
        error: "No content found",
      });
    }

    if (post.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        error: "unauthorized to edit this post",
      });
    }

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json({ data: updated });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.delete("/api/v1/posts/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(204).json({
        error: "No Content found",
      });
    }

    if (post.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        error: "Unauthorized to delete this Post",
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(204).send("Data deleted");
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.get("/api/v1/posts/:id/comments", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }
    const comments = await Comment.find({ post: req.params.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      data: comments,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.post("/api/v1/posts/:id/comments", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        error: "missing content",
      });
    }

    const comment = new Comment({
      content,
      author: req.user.userId,
      post: req.params.id,
    });

    await comment.save();
    res.status(201).json({
      data: comment,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.delete(
  "/api/v1/posts/:id/comments/:cid",
  authMiddleware,
  async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.cid);
      if (!comment) {
        return res.status(404).json({
          error: "comment not found",
        });
      }
      if (comment.author.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          error: "Unauthorized to delete this comment",
        });
      }

      await Comment.findByIdAndDelete(req.params.cid);
      res.status(204).send();
    } catch (err) {
      return res.status(500).json({
        error: "something went wrong",
      });
    }
  },
);

app.listen(PORT);
