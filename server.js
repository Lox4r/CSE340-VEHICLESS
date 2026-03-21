const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const baseController = require("./controllers/baseController");
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities");
const db = require("./database/index");
const session = require("express-session");
const pool = require("./database/");
const flash = require("connect-flash");
const accountRoute = require("./routes/accountRoute");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

app.use(cookieParser());
app.use(utilities.checkJWTToken);
app.use(utilities.handleJWTHeader);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "sessionId",
    secret: process.env.SESSION_SECRET || "superSecret",
    resave: false,
    saveUninitialized: false,
  })
)

app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.use(express.static("public"));
app.use(staticRoutes);

app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

app.use((req, res, next) => {
  const err = new Error("Sorry, we couldn't find that page.");
  err.status = 404;
  next(err);
});

app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  const status = err.status || 500;
  const message = status === 404
    ? err.message
    : "Sorry, the server encountered an unexpected error.";

  console.error(`${status} error at ${req.originalUrl}: ${err.message}`);
  res.status(status).render("errors/error", {
    title: `${status} ${status === 404 ? "Error" : "Server Error"}`,
    message,
    nav,
  });
});

db.query("SELECT NOW()")
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

const port = process.env.PORT || 5500

app.listen(port, () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}`)
})