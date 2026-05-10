const getOverview = async (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Admin service ready"
  });
};

module.exports = {
  getOverview
};
