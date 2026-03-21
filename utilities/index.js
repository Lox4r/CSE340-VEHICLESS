const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")

const buildClassificationList = async (selectedId = null) => {
  const data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" ${
      selectedId == row.classification_id ? "selected" : ""
    }>${row.classification_name}</option>`
  })

  classificationList += "</select>"
  return classificationList
}

const handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value))

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value))

const normalizeImagePath = (path) => {
  if (!path || typeof path !== "string") return "/images/vehicles/no-image.png"

  let cleaned = path.trim()

  if (!cleaned.startsWith("/")) {
    cleaned = `/${cleaned}`
  }

  cleaned = cleaned.replace(/\\/g, "/")
  cleaned = cleaned.replace(
    /\/images\/vehicles\/vehicles\//g,
    "/images/vehicles/"
  )
  cleaned = cleaned.replace(/\/images\/images\//g, "/images/")
  cleaned = cleaned.replace(/\/+/g, "/")

  return cleaned
}

const buildVehicleDetailHTML = function (vehicle) {
  return `
    <section class="vehicle-detail-view">
      <div class="vehicle-detail-image">
        <img src="${normalizeImagePath(vehicle.inv_image)}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-detail-content">
        <p class="vehicle-detail-price">${formatCurrency(vehicle.inv_price)}</p>
        <ul class="vehicle-detail-specs">
          <li><strong>Vehicle:</strong> ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</li>
          <li><strong>Classification:</strong> ${vehicle.classification_name}</li>
          <li><strong>Color:</strong> ${vehicle.inv_color}</li>
          <li><strong>Mileage:</strong> ${formatNumber(vehicle.inv_miles)} miles</li>
        </ul>
        <div class="vehicle-detail-description">
          <h2>Vehicle Description</h2>
          <p>${vehicle.inv_description}</p>
        </div>
        <p class="vehicle-detail-review-link"><a href="/inv/${vehicle.inv_id}/reviews">Read or Write Reviews</a></p>
      </div>
    </section>
  `
}

const getNav = async function () {
  const { rows } = await invModel.getClassifications()

  let navHTML = `
    <ul class="nav-list">
      <li class="nav-item"><a href="/" title="Home page" class="nav-link">Home</a></li>`

  rows.forEach((row) => {
    navHTML += `
      <li class="nav-item">
        <a href="/inv/type/${row.classification_id}" title="Browse our ${row.classification_name} vehicles" class="nav-link">${row.classification_name}</a>
      </li>`
  })

  navHTML += `</ul>`
  return navHTML
}

const buildClassificationGrid = function (data) {
  const vehicles = Array.isArray(data) ? data : data.rows || []

  if (vehicles.length > 0) {
    let grid = '<ul id="inv-display">'
    vehicles.forEach((vehicle) => {
      grid += `
        <li>
          <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${normalizeImagePath(vehicle.inv_thumbnail)}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
          </a>
          <div class="namePrice">
            <hr>
            <h2><a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>
            <span>${formatCurrency(vehicle.inv_price)}</span>
          </div>
        </li>`
    })
    grid += "</ul>"
    return grid
  }

  return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
}

const checkJWTToken = (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

function handleJWTHeader(req, res, next) {
  const token = req.cookies && req.cookies.jwt
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals.loggedin = true
      res.locals.accountData = decoded
    } catch (error) {
      res.locals.loggedin = false
      res.locals.accountData = null
      res.clearCookie("jwt")
    }
  } else {
    res.locals.loggedin = false
    res.locals.accountData = null
  }
  next()
}

function checkLogin(req, res, next) {
  const token = req.cookies && req.cookies.jwt
  if (!token) {
    req.flash("notice", "Please log in to access this page.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals.loggedin = true
    res.locals.accountData = decoded
    next()
  } catch (error) {
    res.locals.loggedin = false
    req.flash("notice", "Please log in again.")
    res.clearCookie("jwt")
    return res.redirect("/account/login")
  }
}

module.exports = {
  buildClassificationList,
  handleErrors,
  buildVehicleDetailHTML,
  getNav,
  buildClassificationGrid,
  checkJWTToken,
  handleJWTHeader,
  checkLogin,
}