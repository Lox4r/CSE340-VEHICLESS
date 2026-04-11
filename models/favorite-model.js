const pool = require('../database/');

async function addFavorite(account_id, inv_id) {
  const sql = `
    INSERT INTO favorites (account_id, inv_id)
    VALUES ($1, $2)
    ON CONFLICT (account_id, inv_id) DO NOTHING
    RETURNING favorite_id, account_id, inv_id, favorite_date;
  `;
  const result = await pool.query(sql, [account_id, inv_id]);
  return result.rows[0] || null;
}

async function removeFavorite(account_id, inv_id) {
  const sql = `
    DELETE FROM favorites
    WHERE account_id = $1 AND inv_id = $2
    RETURNING favorite_id;
  `;
  const result = await pool.query(sql, [account_id, inv_id]);
  return result.rowCount > 0;
}

async function getFavoritesByAccountId(account_id) {
  const sql = `
    SELECT f.favorite_id, f.favorite_date,
           i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price,
           i.inv_thumbnail, i.inv_image, c.classification_name
    FROM favorites f
    JOIN inventory i ON f.inv_id = i.inv_id
    JOIN classification c ON i.classification_id = c.classification_id
    WHERE f.account_id = $1
    ORDER BY f.favorite_date DESC, i.inv_make, i.inv_model;
  `;
  const result = await pool.query(sql, [account_id]);
  return result.rows;
}

async function checkFavorite(account_id, inv_id) {
  const sql = `
    SELECT favorite_id
    FROM favorites
    WHERE account_id = $1 AND inv_id = $2;
  `;
  const result = await pool.query(sql, [account_id, inv_id]);
  return result.rowCount > 0;
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByAccountId,
  checkFavorite,
};
