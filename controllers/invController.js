invController.buildByInventoryId = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const data = await invModel.getInventoryById(inv_id)
  const nav = await utilities.getNav()

  res.render("inventory/detail", {
    title: data.inv_make + " " + data.inv_model,
    nav,
    vehicle: data,
  })
}
