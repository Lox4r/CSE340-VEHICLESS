DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS classification;
DROP TABLE IF EXISTS account;
DROP TYPE IF EXISTS account_type;

CREATE TYPE account_type AS ENUM ('Client', 'Employee', 'Admin');

CREATE TABLE classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL
);

CREATE TABLE inventory (
  inv_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(50) NOT NULL,
  inv_model VARCHAR(50) NOT NULL,
  inv_description TEXT,
  inv_image VARCHAR(100),
  inv_thumbnail VARCHAR(100),
  classification_id INT REFERENCES classification(classification_id)
);

CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50),
  account_lastname VARCHAR(50),
  account_email VARCHAR(100),
  account_password VARCHAR(255),
  account_type account_type DEFAULT 'Client'
);

INSERT INTO classification (classification_name)
VALUES
('Sport'),
('SUV'),
('Truck'),
('Sedan');

INSERT INTO inventory (
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  classification_id
)
VALUES
('GM','Hummer','small interiors','/images/hummer.jpg','/images/hummer-tn.jpg',2),

('Chevrolet','Camaro','A fast sports car with great performance','/images/camaro.jpg','/images/camaro-tn.jpg',1),

('Lamborghini','Aventador','A high-performance luxury sports car','/images/aventador.jpg','/images/aventador-tn.jpg',1),

('Ford','F-150','Reliable full-size pickup truck','/images/f150.jpg','/images/f150-tn.jpg',3);

UPDATE inventory
SET inv_description = REPLACE(inv_description,'small interiors','a huge interior')
WHERE inv_make='GM' AND inv_model='Hummer';

UPDATE inventory
SET
inv_image = REPLACE(inv_image,'/images/','/images/vehicles/'),
inv_thumbnail = REPLACE(inv_thumbnail,'/images/','/images/vehicles/');