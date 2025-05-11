const isLoggedin= (req, res, next) => {
  console.log(req.session);
  if (req.session) {
    return next();
  }
  return res.status(401).json({ message: 'Not logged in' });
};

module.exports = isLoggedin;
