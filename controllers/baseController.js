const utilities = require("../utilities/")

const baseController = {}

baseController.buildHome = async function (req, res, next) {
  const nav = await utilities.getNav()
  const messages = req.flash("info") || []

  res.render("index", {
    title: "Home",
    nav,
    messages,
  })
}

module.exports = baseController