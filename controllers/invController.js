const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

// Build vehicle detail view (FIXED)
invController.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const data = await invModel.getInventoryById(inv_id)
    const nav = await utilities.getNav()

    res.render("inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      nav,
      vehicle: data,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invController
