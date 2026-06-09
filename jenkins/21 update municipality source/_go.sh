#!/bin/bash
# Bendri duomenys
wget -N --backups=0 -q https://www.registrucentras.lt/aduomenys/?byla=adr_gyvenamosios_vietoves.csv -O gyvenvietes.csv
wget -N --backups=0 -q https://www.registrucentras.lt/aduomenys/?byla=adr_gatves.csv -O gatves.csv

psql osm -U osm < bendri_duomenys.sql

# Konkrečių savivaldybių duomenys
wget -N --backups=0 -q https://www.registrucentras.lt/aduomenys/?byla=adr_stat_25.csv -O adresai.csv
psql osm -U osm < copy_full.sql

wget -N --backups=0 -q https://www.registrucentras.lt/aduomenys/?byla=adr_gra_25.json -O adresai.geojson

ogr2ogr -f PostgreSQL \
  PG:"dbname=osm user=osm password= host=localhost port=5432" \
  -lco SCHEMA=address \
  -lco GEOMETRY_NAME=geom \
  -lco FID=objectid \
  -lco PRECISION=NO \
  -lco OVERWRITE=YES \
  -t_srs EPSG:4326 \
  -nln addresses \
  adresai.geojson

psql osm -U osm < update_status.sql
