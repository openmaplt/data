#!/bin/bash
#psql osm -U osm < 00_create_initial_tables.sql

echo Prepare OSM data
psql osm -U osm < 01_prepare_tables.sql

echo Calculate the difference
psql osm -U osm < 02_calculate_diff.sql

echo Done