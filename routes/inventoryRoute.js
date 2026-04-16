const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validation = require("../utilities/inventory-validation")

// PUBLIC ROUTES
router.get("/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

router.get("/detail/:inv_id",
  utilities.handleErrors(invController.buildByInventoryId)
)

// MANAGEMENT (protected)
router.get("/",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.showManagementView)
)

// ADD INVENTORY (protected)
router.get("/add-inventory",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post("/add-inventory",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  validation.newInventoryRules(),
  validation.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router
