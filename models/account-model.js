const bcrypt = require('bcryptjs');
const pool = require('../database/');

async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const existingEmail = await checkExistingEmail(account_email);
    if (existingEmail > 0) {
      throw new Error('This email address is already registered. Please use another one.');
    }
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING account_id, account_firstname, account_lastname, account_email, account_type";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, hashedPassword]);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting account:", error);
    throw new Error("Account registration failed. Please try again.");
  }
}

async function checkExistingEmail(account_email) {
  try {
    const sql = 'SELECT 1 FROM account WHERE account_email = $1';
    const result = await pool.query(sql, [account_email]);
    return result.rowCount;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
}

async function getAccountByEmail(account_email) {
  try {
    const sql = 'SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_email = $1';
    const result = await pool.query(sql, [account_email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error in getAccountByEmail:", error);
    throw error;
  }
}

async function getAccountById(account_id) {
  try {
    const sql = 'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1';
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error in getAccountById:", error);
    throw error;
  }
}

async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1, account_lastname = $2, account_email = $3
      WHERE account_id = $4
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type;
    `;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating account info:", error);
    throw new Error("Update account info failed");
  }
}

async function updateAccountPassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING account_id;
    `;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating account password:", error);
    throw new Error("Update account password failed");
  }
}

async function checkEmailExistsForOtherAccounts(email, currentId) {
  try {
    const sql = 'SELECT 1 FROM account WHERE account_email = $1 AND account_id != $2';
    const result = await pool.query(sql, [email, currentId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('checkEmailExistsForOtherAccounts error', error);
    throw error;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updateAccountPassword,
  checkEmailExistsForOtherAccounts
};
