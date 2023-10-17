require("dotenv").config();

const express = require('express');
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const mongoString = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/blogify";
async function connectDatabase(){
    await mongoose.connect(mongoString);
    mongoose.connection.once("open",() => {
        console.log("Database connected Successfully");
    });
};
connectDatabase();

const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const Blog = require('./models/blog');

app.use(express.static(path.resolve("./public")));
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(checkForAuthenticationCookie("token"));

app.set("view engine","ejs");
app.set("views",path.resolve('./views'));

app.get('/',async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render("home",{
        user: req.user,
        blogs: allBlogs,
    });
});
app.use("/user",userRouter);
app.use("/blog",blogRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));