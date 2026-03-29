const { body, validationResult } = require("express-validator")
const utilities = require("./index")

const classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Please provide a classification name.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name cannot contain spaces or special characters."),
]

const checkClassification = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      classification_name,
    })
  }

  next()
}

const newInventoryRules = () => [
  body("classification_id")
    .trim()
    .notEmpty()
    .withMessage("Please select a classification."),
  body("inv_make")
    .trim()
    .notEmpty()
    .withMessage("Please provide a vehicle make."),
  body("inv_model")
    .trim()
    .notEmpty()
    .withMessage("Please provide a vehicle model."),
  body("inv_year")
    .trim()
    .isInt({ min: 1886, max: 2100 })
    .withMessage("Please provide a valid four-digit year."),
  body("inv_description")
    .trim()
    .notEmpty()
    .withMessage("Please provide a vehicle description."),
  body("inv_image")
    .trim()
    .notEmpty()
    .withMessage("Please provide an image path."),
  body("inv_thumbnail")
    .trim()
    .notEmpty()
    .withMessage("Please provide a thumbnail path."),
  body("inv_price")
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Please provide a valid price."),
  body("inv_miles")
    .trim()
    .isInt({ min: 0 })
    .withMessage("Please provide valid mileage."),
  body("inv_color")
    .trim()
    .notEmpty()
    .withMessage("Please provide a vehicle color."),
]

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)

    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }

  next()
}

const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)

    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }

  next()
}

module.exports = {
  classificationRules,
  checkClassification,
  newInventoryRules,
  checkInventoryData,
  checkUpdateData,
}
