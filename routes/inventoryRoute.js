const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const invVal = require("../utilities/inventory-validation")
const reviewController = require("../controllers/reviewController")
const { reviewRules, checkReviewData } = require("../utilities/review-validation")
const utilities = require("../utilities")

router.get("/", utilities.handleErrors(invController.showManagementView))
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.getVehicleDetail))
router.get("/trigger-error", utilities.handleErrors(invController.triggerIntentionalError))

router.get("/add-classification", utilities.handleErrors(invController.showAddClassificationForm))
router.post(
  "/add-classification",
  invVal.classificationRules(),
  utilities.handleErrors(invVal.checkClassification),
  utilities.handleErrors(invController.addClassification)
)

router.get("/add-inventory", utilities.handleErrors(invController.showAddInventoryForm))
router.post(
  "/add-inventory",
  invVal.newInventoryRules(),
  utilities.handleErrors(invVal.checkInventoryData),
  utilities.handleErrors(invController.processAddInventoryForm)
)

router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))
router.post("/update", invVal.newInventoryRules(), utilities.handleErrors(invVal.checkUpdateData), utilities.handleErrors(invController.updateInventory))
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteInventoryView))
router.post("/delete", utilities.handleErrors(invController.deleteInventoryItem))

router.get("/:inv_id/reviews", utilities.handleErrors(reviewController.showReviewForm))
router.post("/:inv_id/reviews", reviewRules(), checkReviewData, utilities.handleErrors(reviewController.submitReview))

module.exports = router
