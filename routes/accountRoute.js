const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const accountValidate = require("../utilities/account-validation");
const utilities = require("../utilities");

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.post(
  "/register",
  accountValidate.registrationRules(),
  utilities.handleErrors(accountValidate.checkRegData),
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  accountValidate.loginRules(),
  utilities.handleErrors(accountValidate.checkLoginData),
  utilities.handleErrors(accountController.accountLogin)
);

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
);

router.post(
  "/update",
  utilities.checkLogin,
  accountValidate.updateAccountRules(),
  utilities.handleErrors(accountValidate.checkUpdateAccountData),
  utilities.handleErrors(accountController.updateAccount)
);

router.post(
  "/update-password",
  utilities.checkLogin,
  accountValidate.updatePasswordRules(),
  utilities.handleErrors(accountValidate.checkUpdatePasswordData),
  utilities.handleErrors(accountController.updatePassword)
);

router.get("/logout", accountController.logout);

module.exports = router;
