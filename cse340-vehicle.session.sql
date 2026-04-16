UPDATE inventory
SET inv_image = '/images/vehicles/' || SUBSTRING(inv_image FROM '[^/]+$'),
    inv_thumbnail = '/images/vehicles/' || SUBSTRING(inv_thumbnail FROM '[^/]+$');