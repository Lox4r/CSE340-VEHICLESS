const jwt = require("jsonwebtoken");
require("dotenv").config();
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

function buildToken(account) {
  return jwt.sign(
    {
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_type: account.account_type,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
}

function setJwtCookie(res, token) {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000,
  });
}

async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: "",
    });
  } catch (error) {
    next(error);
  }
}

async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname: "",
      account_lastname: "",
      account_email: "",
    });
  } catch (error) {
    next(error);
  }
}

async function registerAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body;
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login");
    }

    req.flash("notice", "Sorry, the registration failed.");
    const nav = await utilities.getNav();
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: ["Sorry, the registration failed."],
      account_firstname,
      account_lastname,
      account_email,
    });
  } catch (error) {
    next(error);
  }
}

async function accountLogin(req, res, next) {
  try {
    const { account_email, account_password } = req.body;
    const account = await accountModel.getAccountByEmail(account_email);

    if (!account) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).redirect("/account/login");
    }

    const isMatch = await bcrypt.compare(account_password, account.account_password);
    if (!isMatch) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).redirect("/account/login");
    }

    const token = buildToken(account);
    setJwtCookie(res, token);
    return res.redirect("/account/");
  } catch (error) {
    next(error);
  }
}

async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(res.locals.accountData.account_id);

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      accountData,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

async function buildUpdateAccountView(req, res, next) {
  try {
    const account_id = Number(req.params.account_id || req.body.account_id || res.locals.accountData.account_id);
    if (!account_id || account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "You may only edit your own account.");
      return res.redirect("/account/");
    }

    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  } catch (error) {
    next(error);
  }
}

async function updateAccount(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  try {
    const updatedAccount = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updatedAccount) {
      const token = buildToken(updatedAccount);
      setJwtCookie(res, token);
      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account/");
    }

    req.flash("notice", "Sorry, the account update failed.");
    return res.redirect(`/account/update/${account_id}`);
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  const { account_id, account_password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updateAccountPassword(account_id, hashedPassword);

    if (result) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/");
    }

    req.flash("notice", "Sorry, the password update failed.");
    return res.redirect(`/account/update/${account_id}`);
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  return res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccountView,
  updateAccount,
  updatePassword,
  logout,
};
