#!/bin/bash
python3 download.py

ogr2ogr -f PostgreSQL \
  PG:"dbname=osm user=osm password= host=localhost port=5432" \
  -lco SCHEMA=address \
  -lco GEOMETRY_NAME=geom \
  -lco FID=objectid \
  -lco PRECISION=NO \
  -lco OVERWRITE=YES \
  -nln vilnius_addresses \
  vilnius_addr.ndjson

psql osm -U osm < 00_prepare_vilnius_source.sql
