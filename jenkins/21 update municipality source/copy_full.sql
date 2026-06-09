truncate table address.addresses_full;
\copy address.addresses_full FROM 'adresai.csv' DELIMITER '|' CSV HEADER;
