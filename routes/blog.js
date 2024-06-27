const router = require("express").Router();
const Blog = require("../models/blog");
const multer = require("multer");
const Comment = require("../models/comment");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const storage = multer.memoryStorage();
const upload = multer({ storage });
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});
router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  let coverImageURL = "";

  if (req.file) {
    try {
      coverImageURL = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blogify" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    } catch (error) {
      return res.status(500).send("Error uploading image");
    }
    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL,
    });

    return res.redirect(`/blog/${blog._id}`);
  } else {
    return {
      success: false,
      message: "Cover image not given",
    };
  }
});
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: blog._id }).populate(
    "createdBy"
  );
  return res.render("blog", {
    user: req.user,
    blog: blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
