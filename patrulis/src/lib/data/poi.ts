import { db } from '@/lib/db';

export type POIChange = {
  obj_type: string;
  osm_id: number;
  x_type: 'D' | 'N' | 'C';
  name: string;
};

export async function getPOIChanges(
  page = 1,
  pageSize = 50,
): Promise<POIChange[]> {
  const offset = (page - 1) * pageSize;
  const query = `
    SELECT c.obj_type
         , c.osm_id
         , c.x_type
         , COALESCE(c.name, p.attr->>'name') as name
    FROM places.poi_change c
    LEFT JOIN places.poi p ON c.osm_id = p.osm_id AND c.obj_type = p.obj_type AND c.x_type = 'D'
    ORDER BY CASE WHEN c.x_type = 'D' THEN 1 WHEN c.x_type = 'C' THEN 2 ELSE 3 END, 2
    LIMIT $1 OFFSET $2
  `;
  const result = await db.query(query, [pageSize, offset]);
  return result.rows;
}

export async function getPOICount(): Promise<number> {
  const result = await db.query(
    'SELECT count(1) as total FROM places.poi_change',
  );
  return Number(result.rows[0].total);
}

export type POIDetail = {
  tag: string;
  old_val: string | null;
  new_val: string | null;
  changed: boolean;
};

export type POIInfo = {
  lat: number;
  lon: number;
  osm_id: number;
  obj_type: string;
  x_type: string;
};

export async function getPOIDetail(
  id: string,
  tp: string,
): Promise<{ details: POIDetail[]; info: POIInfo }> {
  // id format is like 'n12345'
  const obj_type = id.substring(0, 1);
  const osm_id = Number(id.substring(1));

  const tags = [
    'lat',
    'lon',
    'name',
    'description',
    'information',
    'image',
    'opening_hours',
    'phone',
    'email',
    'website',
    'url',
    'addr:city',
    'addr:street',
    'addr:postcode',
    'addr:housenumber',
    'real_ale',
    'historic',
    'man_made',
    'tower:type',
    'fee',
    'ref',
    'wikipedia',
    'wikipedia:lt',
    'wikipedia:en',
    'height',
    'alt_name',
    'ref:lt:kpd',
    'maxspeed',
    'operator',
    'tourism',
    'site_type',
    'amenity',
    'shop',
    'religion',
    'denomination',
    'official_name',
    'attraction:type',
    'distance',
    'natural',
  ];

  let query = '';
  const params: (string | number)[] = [osm_id, obj_type];

  // Logic to build comparison
  // old state comes from places.poi (using attr->>'tag')
  // new state comes from places.poi_change (using columns)

  if (tp === 'D') {
    // Deleted: old state exists, new state is null
    query = `
      SELECT st_y(geom) as old_lat, null as new_lat,
             st_x(geom) as old_lon, null as new_lon,
             attr->>'name' as old_name, null as new_name,
             attr->>'description' as old_description, null as new_description,
             attr->>'information' as old_information, null as new_information,
             attr->>'image' as old_image, null as new_image,
             attr->>'opening_hours' as old_opening_hours, null as new_opening_hours,
             attr->>'phone' as old_phone, null as new_phone,
             attr->>'email' as old_email, null as new_email,
             attr->>'website' as old_website, null as new_website,
             attr->>'url' as old_url, null as new_url,
             attr->>'addr:city' as old_addrcity, null as new_addrcity,
             attr->>'addr:street' as old_addrstreet, null as new_addrstreet,
             attr->>'addr:postcode' as old_addrpostcode, null as new_addrpostcode,
             attr->>'addr:housenumber' as old_addrhousenumber, null as new_addrhousenumber,
             attr->>'real_ale' as old_real_ale, null as new_real_ale,
             attr->>'historic' as old_historic, null as new_historic,
             attr->>'man_made' as old_man_made, null as new_man_made,
             attr->>'tower:type' as old_towertype, null as new_towertype,
             attr->>'fee' as old_fee, null as new_fee,
             attr->>'ref' as old_ref, null as new_ref,
             attr->>'wikipedia' as old_wikipedia, null as new_wikipedia,
             attr->>'wikipedia:lt' as old_wikipedialt, null as new_wikipedialt,
             attr->>'wikipedia:en' as old_wikipediaen, null as new_wikipediaen,
             attr->>'height' as old_height, null as new_height,
             attr->>'alt_name' as old_alt_name, null as new_alt_name,
             attr->>'ref:lt:kpd' as old_refltkpd, null as new_refltkpd,
             attr->>'maxspeed' as old_maxspeed, null as new_maxspeed,
             attr->>'operator' as old_operator, null as new_operator,
             attr->>'tourism' as old_tourism, null as new_tourism,
             attr->>'site_type' as old_site_type, null as new_site_type,
             attr->>'amenity' as old_amenity, null as new_amenity,
             attr->>'shop' as old_shop, null as new_shop,
             attr->>'religion' as old_religion, null as new_religion,
             attr->>'denomination' as old_denomination, null as new_denomination,
             attr->>'official_name' as old_official_name, null as new_official_name,
             attr->>'attraction:type' as old_attraction_type, null as new_attraction_type,
             attr->>'distance' as old_distance, null as new_distance,
             attr->>'natural' as old_natural, null as new_natural,
             st_y(geom) as old_lat_raw, st_x(geom) as old_lon_raw,
             null as new_lat_raw, null as new_lon_raw
      FROM places.poi
      WHERE osm_id = $1 AND obj_type = $2
    `;
  } else if (tp === 'N') {
    // New: old state is null, new state exists in poi_change
    // NOTE: In the database, 'lat' column actually stores Longitude (25.x)
    // and 'lon' column stores Latitude (55.x). We swap them here.
    query = `
      SELECT null as old_lat, lon as new_lat,
             null as old_lon, lat as new_lon,
             null as old_name, name as new_name,
             null as old_description, description as new_description,
             null as old_information, information as new_information,
             null as old_image, image as new_image,
             null as old_opening_hours, opening_hours as new_opening_hours,
             null as old_phone, phone as new_phone,
             null as old_email, email as new_email,
             null as old_website, website as new_website,
             null as old_url, url as new_url,
             null as old_addrcity, "addr:city" as new_addrcity,
             null as old_addrstreet, "addr:street" as new_addrstreet,
             null as old_addrpostcode, "addr:postcode" as new_addrpostcode,
             null as old_addrhousenumber, "addr:housenumber" as new_addrhousenumber,
             null as old_real_ale, real_ale as new_real_ale,
             null as old_historic, historic as new_historic,
             null as old_man_made, man_made as new_man_made,
             null as old_towertype, "tower:type" as new_towertype,
             null as old_fee, fee as new_fee,
             null as old_ref, ref as new_ref,
             null as old_wikipedia, wikipedia as new_wikipedia,
             null as old_wikipedialt, "wikipedia:lt" as new_wikipedialt,
             null as old_wikipediaen, "wikipedia:en" as new_wikipediaen,
             null as old_height, height as new_height,
             null as old_alt_name, alt_name as new_alt_name,
             null as old_refltkpd, "ref:lt:kpd" as new_refltkpd,
             null as old_maxspeed, maxspeed as new_maxspeed,
             null as old_operator, operator as new_operator,
             null as old_tourism, tourism as new_tourism,
             null as old_site_type, site_type as new_site_type,
             null as old_amenity, amenity as new_amenity,
             null as old_shop, shop as new_shop,
             null as old_religion, religion as new_religion,
             null as old_denomination, denomination as new_denomination,
             null as old_official_name, official_name as new_official_name,
             null as old_attraction_type, "attraction:type" as new_attraction_type,
             null as old_distance, distance as new_distance,
             null as old_natural, "natural" as new_natural,
             lon as new_lat_raw, lat as new_lon_raw,
             null as old_lat_raw, null as old_lon_raw
      FROM places.poi_change
      WHERE osm_id = $1 AND obj_type = $2
    `;
  } else {
    // Change (C): both exist
    // Swapping lat/lon for 'new' state from poi_change
    query = `
      SELECT st_y(p.geom) as old_lat, c.lon as new_lat,
             st_x(p.geom) as old_lon, c.lat as new_lon,
             p.attr->>'name' as old_name, c.name as new_name,
             p.attr->>'description' as old_description, c.description as new_description,
             p.attr->>'information' as old_information, c.information as new_information,
             p.attr->>'image' as old_image, c.image as new_image,
             p.attr->>'opening_hours' as old_opening_hours, c.opening_hours as new_opening_hours,
             p.attr->>'phone' as old_phone, c.phone as new_phone,
             p.attr->>'email' as old_email, c.email as new_email,
             p.attr->>'website' as old_website, c.website as new_website,
             p.attr->>'url' as old_url, c.url as new_url,
             p.attr->>'addr:city' as old_addrcity, c."addr:city" as new_addrcity,
             p.attr->>'addr:street' as old_addrstreet, c."addr:street" as new_addrstreet,
             p.attr->>'addr:postcode' as old_addrpostcode, c."addr:postcode" as new_addrpostcode,
             p.attr->>'addr:housenumber' as old_addrhousenumber, c."addr:housenumber" as new_addrhousenumber,
             p.attr->>'real_ale' as old_real_ale, c.real_ale as new_real_ale,
             p.attr->>'historic' as old_historic, c.historic as new_historic,
             p.attr->>'man_made' as old_man_made, c.man_made as new_man_made,
             p.attr->>'tower:type' as old_towertype, c."tower:type" as new_towertype,
             p.attr->>'fee' as old_fee, c.fee as new_fee,
             p.attr->>'ref' as old_ref, c.ref as new_ref,
             p.attr->>'wikipedia' as old_wikipedia, c.wikipedia as new_wikipedia,
             p.attr->>'wikipedia:lt' as old_wikipedialt, c."wikipedia:lt" as new_wikipedialt,
             p.attr->>'wikipedia:en' as old_wikipediaen, c."wikipedia:en" as new_wikipediaen,
             p.attr->>'height' as old_height, c.height as new_height,
             p.attr->>'alt_name' as old_alt_name, c.alt_name as new_alt_name,
             p.attr->>'ref:lt:kpd' as old_refltkpd, c."ref:lt:kpd" as new_refltkpd,
             p.attr->>'maxspeed' as old_maxspeed, c.maxspeed as new_maxspeed,
             p.attr->>'operator' as old_operator, c.operator as new_operator,
             p.attr->>'tourism' as old_tourism, c.tourism as new_tourism,
             p.attr->>'site_type' as old_site_type, c.site_type as new_site_type,
             p.attr->>'amenity' as old_amenity, c.amenity as new_amenity,
             p.attr->>'shop' as old_shop, c.shop as new_shop,
             p.attr->>'religion' as old_religion, c.religion as new_religion,
             p.attr->>'denomination' as old_denomination, c.denomination as new_denomination,
             p.attr->>'official_name' as old_official_name, c.official_name as new_official_name,
             p.attr->>'attraction:type' as old_attractiontype, c."attraction:type" as new_attractiontype,
             p.attr->>'distance' as old_distance, c.distance as new_distance,
             p.attr->>'natural' as old_natural, c."natural" as new_natural,
             c.lon as new_lat_raw, c.lat as new_lon_raw,
             st_y(p.geom) as old_lat_raw, st_x(p.geom) as old_lon_raw
      FROM places.poi_change c
      JOIN places.poi p ON c.osm_id = p.osm_id AND c.obj_type = p.obj_type
      WHERE c.osm_id = $1 AND c.obj_type = $2
    `;
  }

  const result = await db.query(query, params);
  if (result.rows.length === 0) {
    throw new Error('POI not found');
  }

  const row = result.rows[0];
  const details: POIDetail[] = [];

  for (const tag of tags) {
    const dbTag = tag.replace(/:/g, '');
    const oldVal = row[`old_${dbTag}`];
    const newVal = row[`new_${dbTag}`];

    if (oldVal !== null || newVal !== null) {
      let isChanged = String(oldVal) !== String(newVal);
      let displayOld = oldVal ? String(oldVal) : null;
      let displayNew = newVal ? String(newVal) : null;

      // Formatting coordinates for both comparison and display (using 4 decimal places)
      if (tag === 'lat' || tag === 'lon') {
        const oldNum = oldVal !== null ? parseFloat(String(oldVal)) : null;
        const newNum = newVal !== null ? parseFloat(String(newVal)) : null;

        if (
          oldNum !== null &&
          newNum !== null &&
          !Number.isNaN(oldNum) &&
          !Number.isNaN(newNum)
        ) {
          // If difference is less than 0.0001 (4 decimal places), we consider it unchanged
          if (Math.abs(oldNum - newNum) < 0.0001) {
            isChanged = false;
          }
          // Round displayed values to 4 decimal places for consistency
          displayOld = oldNum.toFixed(4);
          displayNew = newNum.toFixed(4);
        } else if (oldNum !== null && !Number.isNaN(oldNum)) {
          displayOld = oldNum.toFixed(4);
        } else if (newNum !== null && !Number.isNaN(newNum)) {
          displayNew = newNum.toFixed(4);
        }
      }

      details.push({
        tag: tag,
        old_val: displayOld,
        new_val: displayNew,
        changed: isChanged,
      });
    }
  }

  return {
    details,
    info: {
      lat: Number(row.new_lat_raw || row.old_lat_raw),
      lon: Number(row.new_lon_raw || row.old_lon_raw),
      osm_id,
      obj_type,
      x_type: tp,
    },
  };
}

export type POITransfer = {
  uid: number;
  obj_type: string;
  osm_id: number;
  name: string;
  atstumas: number;
  old_id: number;
  old_type: string;
  x_type: string;
};

export async function getPOIPotentialTransfers(
  osm_id: number,
  obj_type: string,
): Promise<POITransfer[]> {
  const query = `
    SELECT round(st_distance(del.geom::geography, pos.geom::geography)) as atstumas
         , pos.name
         , pos.osm_id
         , pos.obj_type
         , del.uid
         , del.osm_id as old_id
         , del.obj_type as old_type
         , pos.x_type
    FROM places.poi_change pos
       , places.poi_change del
    WHERE del.osm_id = $1
      AND del.obj_type = $2
      AND pos.x_type != 'D'
      AND st_distance(del.geom::geography, pos.geom::geography) < 1000
    ORDER BY 1
  `;
  const result = await db.query(query, [osm_id, obj_type]);
  return result.rows;
}
