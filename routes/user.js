const User = require("../models/user");

const router = require("express").Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});
router.get("/signup", (req, res) => {
  return res.render("signup");
});
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) return res.render("signup", { error: "User already exists" });
  const newUser = await User.create({
    fullName,
    email,
    password,
  });
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Problem creating token",
    });
  }
});
router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
