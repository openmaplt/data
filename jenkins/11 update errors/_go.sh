#!/bin/bash
echo ====== UPDATE ERROR LIST ======
psql -U osm osm < recalc.sql
