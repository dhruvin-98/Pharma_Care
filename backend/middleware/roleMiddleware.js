module.exports.onlyPharmacist = (req, res, next) => {
  if (!req.user || req.user.userType !== "pharmacist") {
    return res.status(403).json({ message: "Pharmacist access only" });
  }
  next();
};
