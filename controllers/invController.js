const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

invCont.showManagementView = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    error: null,
  });
};

invCont.showAddClassificationForm = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    message: req.flash("success") || null,
    errors: req.flash("error") || null,
    classification_name: req.flash("classification_name") || "",
  });
};

invCont.showAddInventoryForm = async function (req, res) {
  const classificationList = await utilities.buildClassificationList();
  const nav = await utilities.getNav();
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    classificationList,
    nav,
    inv_make: "",
    inv_model: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_year: "",
    inv_miles: "",
    inv_color: "",
    message: req.flash("message") || null,
  });
};

invCont.processAddInventoryForm = async function (req, res) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  if (!classification_id || !inv_make || !inv_model || !inv_description || !inv_price || !inv_year || !inv_miles || !inv_color) {
    const classificationList = await utilities.buildClassificationList(classification_id);
    const nav = await utilities.getNav();
    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      message: "All fields are required.",
      classificationList,
      nav,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
  }

  const insertResult = await invModel.addInventoryItem({
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  });

  if (insertResult.rowCount === 1) {
    req.flash("success", "Vehicle added successfully!");
    return res.redirect("/inv");
  }

  const classificationList = await utilities.buildClassificationList(classification_id);
  const nav = await utilities.getNav();
  return res.status(500).render("inventory/add-inventory", {
    title: "Add New Vehicle",
    classificationList,
    nav,
    message: "There was an error adding the vehicle.",
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  });
};

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = Number(req.params.classificationId);
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const nav = await utilities.getNav();

  if (!data || data.length === 0) {
    const err = new Error("Sorry, no vehicles were found for that classification.");
    err.status = 404;
    return next(err);
  }

  const grid = await utilities.buildClassificationGrid(data);
  const className = data[0].classification_name;

  res.render("inventory/classification", {
    title: `${className} Vehicles`,
    nav,
    grid,
    errors: null,
  });
};

invCont.getVehicleDetail = async function (req, res, next) {
  const inv_id = Number(req.params.invId);
  const vehicle = await invModel.getInventoryItemById(inv_id);

  if (!vehicle) {
    const err = new Error("Sorry, that vehicle could not be found.");
    err.status = 404;
    return next(err);
  }

  const nav = await utilities.getNav();
  const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle);

  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicleHTML,
  });
};

invCont.triggerIntentionalError = async function (req, res, next) {
  const err = new Error("Intentional 500 error triggered for assignment testing.");
  err.status = 500;
  next(err);
};

invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = Number(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData && invData.length > 0) {
    return res.json(invData);
  }
  next(new Error("No data returned"));
};

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;

  if (!classification_name || classification_name.trim() === "") {
    req.flash("error", "Classification name cannot be empty.");
    return res.redirect("/inv/add-classification");
  }

  const result = await invModel.insertClassification(classification_name);
  if (result.rowCount > 0) {
    req.flash("success", "Classification added successfully!");
    return res.redirect("/inv/type/" + result.rows[0].classification_id);
  }

  req.flash("error", "Failed to add classification.");
  res.redirect("/inv/add-classification");
};

invCont.editInventoryView = async function (req, res) {
  const inv_id = Number(req.params.inv_id);
  const nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

invCont.updateInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    return res.redirect("/inv/");
  }

  const classificationSelect = await utilities.buildClassificationList(classification_id);
  const itemName = `${inv_make} ${inv_model}`;
  req.flash("notice", "Sorry, the update failed.");
  res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
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
  });
};

invCont.buildDeleteInventoryView = async function (req, res) {
  const inv_id = Number(req.params.inv_id);
  const nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  });
};

invCont.deleteInventoryItem = async function (req, res) {
  const inv_id = Number(req.body.inv_id);
  const deleteResult = await invModel.deleteInventoryItem(inv_id);

  if (deleteResult.rowCount) {
    req.flash("notice", "The inventory item was successfully deleted.");
    return res.redirect("/inv");
  }

  req.flash("notice", "Sorry, the delete failed.");
  res.redirect("/inv/delete/" + inv_id);
};

module.exports = invCont;
