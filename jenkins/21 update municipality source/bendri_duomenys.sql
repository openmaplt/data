\echo Gatvės
truncate table address.gatves;
\copy address.gatves FROM 'gatves.csv' DELIMITER '|' CSV HEADER;

\echo Gyvenvietės
truncate table address.gyvenvietes;
\copy address.gyvenvietes FROM 'gyvenvietes.csv' DELIMITER '|' CSV HEADER;
