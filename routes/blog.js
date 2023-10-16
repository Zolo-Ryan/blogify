const router = require("express").Router();
const Blog = require("../models/blog");
const path = require("path");
const multer = require("multer");
const Comment = require("../models/comment");

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, path.resolve('./public/uploads/'));
    },
    filename: (req,file,cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null,fileName);
    },
});
const upload = multer({storage});

router.get("/add-new",(req,res) => {
    return res.render("addBlog",{
        user: req.user,
    });
});
router.post("/",upload.single("coverImage"),async (req,res) =>{
    const { title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
});
router.get("/:id", async (req,res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({blogId: blog._id}).populate("createdBy");
    // console.log(comments);
    return res.render("blog",{
        user: req.user,
        blog: blog,
        comments,
    })
});

router.post("/comment/:blogId",async (req,res) => {
    const comment = await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
})

module.exports = router;