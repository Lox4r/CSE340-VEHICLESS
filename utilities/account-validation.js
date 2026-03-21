const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email already exists. Please use a different one.");
        }
      }),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/login", {
      errors: errors.array().map(err => err.msg),
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/register", {
      errors: errors.array().map(err => err.msg),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        
        if (req.body.current_account_email && account_email !== req.body.current_account_email) {
          const emailExists = await accountModel.checkExistingEmail(account_email);
          if (emailExists) {
            throw new Error("Email already exists. Please use a different one.");
          }
        }
        return true;
      }),
  ];
};

validate.checkUpdateAccountData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/update-account", {
      errors: errors.array().map(err => err.msg),
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id: req.body.account_id,
    });
    return;
  }
  next();
};

validate.updatePasswordRules = () => {
  return [
    body("new_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, numbers, and symbols."),
  ];
};

validate.checkUpdatePasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  const { account_id } = req.body;
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/update-account", {
      errors: errors.array().map(err => err.msg),
      title: "Update Account",
      nav,
      account_id,
    });
    return;
  }
  next();
};

module.exports = validate;
