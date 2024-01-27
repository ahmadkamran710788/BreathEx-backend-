const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const admin = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({ msg: "No auth token access denied" });
    }

    const verified = jwt.verify(token, "passwordKey");
    const user = await Admin.findById(verified.id);
    if (user.type == "Patient" || user.type == "Doctor") {
      return res.status(401).json({ msg: "You are not admin" });
    }
    req.user = verified.id;
    req.token = token;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ msg: "Token verification failed, authorization denied" });
  }
};
module.exports = admin;
