const { ValidateSignature } = require("../../utils");

module.exports = async (req, res, next) => {
  try {
    const isAuthorized = await ValidateSignature(req);

    if (isAuthorized) {
      // Convert _id to id for consistency
      if (req.user._id) {
        req.user.id = req.user._id;
      }
      return next();
    }
    return res.status(403).json({ message: "Not Authorized" });
  } catch (error) {
    return res.status(403).json({ message: "Not Authorized" });
  }
};
