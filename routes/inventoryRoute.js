const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validation = require("../utilities/inventory-validation")

// PUBLIC ROUTES
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.getVehicleDetail)
)

// MANAGEMENT (protected)
router.get(
  "/",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.showManagementView)
)

// ADD CLASSIFICATION (protected)
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.showAddClassificationForm)
)

router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  validation.classificationRules(),
  utilities.handleErrors(validation.checkClassification),
  utilities.handleErrors(invController.addClassification)
)

// ADD INVENTORY (protected)
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.showAddInventoryForm)
)

router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  validation.newInventoryRules(),
  utilities.handleErrors(validation.checkInventoryData),
  utilities.handleErrors(invController.processAddInventoryForm)
)

// INVENTORY JSON
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// EDIT INVENTORY (protected)
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
)

router.post(
  "/update",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  validation.newInventoryRules(),
  utilities.handleErrors(validation.checkUpdateData),
  utilities.handleErrors(invController.updateInventory)
)

// DELETE INVENTORY (protected)
router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteInventoryView)
)

router.post(
  "/delete",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
)

// Intentional error route for testing
router.get(
  "/trigger-error",
  utilities.handleErrors(invController.triggerIntentionalError)
)

module.exports = router
