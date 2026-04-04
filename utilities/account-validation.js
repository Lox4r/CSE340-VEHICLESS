const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

validate.registrationRules = () => [
  body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a first name."),
  body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
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
    .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, numbers, and symbols."),
];

validate.loginRules = () => [
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

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array().map((err) => err.msg),
      account_email,
    });
  }
  next();
};

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array().map((err) => err.msg),
      account_firstname,
      account_lastname,
      account_email,
    });
  }
  next();
};

validate.updateAccountRules = () => [
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
      const currentId = Number(req.body.account_id);
      const emailExists = await accountModel.checkEmailExistsForOtherAccounts(account_email, currentId);
      if (emailExists) {
        throw new Error("Email already exists. Please use a different one.");
      }
      return true;
    }),
];

validate.checkUpdateAccountData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array().map((err) => err.msg),
      accountData: {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        account_type: res.locals.accountData.account_type,
      },
      account_firstname,
      account_lastname,
      account_email,
    });
  }
  next();
};

validate.updatePasswordRules = () => [
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
    .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, numbers, and symbols."),
];

validate.checkUpdatePasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  const { account_id } = req.body;
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array().map((err) => err.msg),
      accountData,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  }
  next();
};

module.exports = validate;
