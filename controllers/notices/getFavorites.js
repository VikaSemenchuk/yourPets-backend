const User = require("../../models/users/users");

const getFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const skip = (page - 1) * limit;
    const endIndex = skip + limit;

    const user =  req.user;

    const allFavNotices = user.favorites;

    const total = allFavNotices.length;
    const noticesList = allFavNotices.slice(skip, endIndex);

    return res.status(200).json({ allFavNotices, noticesList, total });
  } catch (err) {
    res.status(500).json({ message: "Ooops... ListContacts" });
  }
};

module.exports = {
  getFavorites,
};
