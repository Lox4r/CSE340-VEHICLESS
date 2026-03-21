const pool = require("../database/");
const invModel = {};

invModel.addInventoryItem = async (vehicleData) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = vehicleData;

  const sql = `
    INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  return pool.query(sql, [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color]);
};

invModel.insertClassification = async function (classification_name) {
  const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
  return await pool.query(sql, [classification_name]);
};

invModel.getClassifications = async function () {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
};

invModel.getInventoryByClassificationId = async function (classification_id) {
  const data = await pool.query(
    `SELECT i.*, c.classification_name
     FROM inventory AS i
     JOIN classification AS c
       ON i.classification_id = c.classification_id
     WHERE i.classification_id = $1
     ORDER BY i.inv_make, i.inv_model`,
    [classification_id]
  );
  return data.rows;
};

invModel.getInventoryItemById = async function (inv_id) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM inventory i
    JOIN classification c ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1
  `;
  const data = await pool.query(sql, [inv_id]);
  return data.rows[0] || null;
};

invModel.getVehicleById = invModel.getInventoryItemById;

invModel.getInventoryById = async function (inv_id) {
  const sql = `SELECT * FROM inventory WHERE inv_id = $1`;
  const result = await pool.query(sql, [inv_id]);
  return result.rows[0];
};

invModel.updateInventory = async function (
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
) {
  const sql = `
    UPDATE public.inventory
    SET inv_make = $1, inv_model = $2, inv_description = $3,
    inv_image = $4, inv_thumbnail = $5, inv_price = $6,
    inv_year = $7, inv_miles = $8, inv_color = $9,
    classification_id = $10
    WHERE inv_id = $11
    RETURNING *;
  `;
  const data = await pool.query(sql, [
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
    inv_id,
  ]);
  return data.rows[0];
};

invModel.deleteInventoryItem = async function (inv_id) {
  const sql = "DELETE FROM inventory WHERE inv_id = $1";
  return await pool.query(sql, [inv_id]);
};

module.exports = invModel;
