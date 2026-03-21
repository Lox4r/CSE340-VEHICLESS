const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const invValidation = require("../utilities/inventory-validation")
const Util = require("../utilities")

router.get(
  "/add-classification",
  Util.handleErrors(invController.showAddClassificationForm)
)

router.post(
  "/add-classification",
  invValidation.checkClassification,
  Util.handleErrors(invController.addClassification)
)

module.exports = router
