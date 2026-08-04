create or replace function places.transfer_id(p_old_osm_id bigint, p_old_type text, p_new_osm_id bigint, p_new_type text, p_new_change text, p_uid int) returns void as $$
declare
l_dummy text;
begin
  select places.accept_change(p_old_osm_id, p_old_type, 'D') into l_dummy;
  select places.accept_change(p_new_osm_id, p_new_type, p_new_change) into l_dummy;
  update places.poi set uid = p_uid where osm_id = p_new_osm_id and obj_type = p_new_type;
end
$$ language plpgsql;

create or replace function places.process_poi_change() returns text as $$
declare
c record;
l_count integer := 0;
l_poi places.poi%rowtype;
l_existing integer;
begin
  raise notice 'Starting process_poi_change %', clock_timestamp();
  delete from places.poi_change;
  update places.poi set x = null;

  for c in (select osm_id
                  ,'n' obj_type
                  ,coalesce("name:lt", name, operator) AS name
                  ,description
                  ,information
                  ,image
                  ,opening_hours
                  ,coalesce("contact:phone", phone) phone
                  ,coalesce("contact:email", email) email
                  ,coalesce("contact:website", website) website
                  ,url
                  ,"addr:city"
                  ,"addr:street"
                  ,"addr:postcode"
                  ,"addr:housenumber"
                  ,real_ale
                  ,historic
                  ,man_made
                  ,"tower:type"
                  ,fee
                  ,ref
                  ,coalesce(wikipedia, "subject:wikipedia") AS wikipedia
                  ,"wikipedia:lt"
                  ,"wikipedia:en"
                  ,height
                  ,alt_name
                  ,"ref:lt:kpd"
                  ,maxspeed
                  ,operator
                  ,tourism
                  ,archaeological_site site_type
                  ,amenity
                  ,fireplace
                  ,highway
                  ,access
                  ,shop
                  ,whitewater
                  ,"waterway:milestone" milestone
                  ,religion
                  ,denomination
                  ,office
                  ,official_name
                  ,"attraction:type"
                  ,distance
                  ,"natural"
                  ,round(cast(st_x(st_transform(way, 4326)) as numeric), 4) lat
                  ,round(cast(st_y(st_transform(way, 4326)) as numeric), 4) lon
                  ,st_transform(way, 4326) as geom
              from planet_osm_point
             where ((tourism is not null and tourism not in ('artwork', 'camp_pitch') and (tourism != 'information' or information = 'office') and coalesce(subitem, 'no') != 'yes')
                or (historic is not null and
                    historic not in ('wayside_cross', 'wayside_shrine', 'boundary_stone', 'yes', 'building', 'tomb', 'memorial', 'pillory', 'aircraft') and
                    coalesce(memorial, '!@#') != 'plaque' and coalesce(subitem, 'no') != 'yes')
                or "ref:lt:kpd" is not null
                or (amenity is not null and amenity not in ('baby_hatch',
                                                            'bench',
                                                            'bicycle_parking',
                                                            'bicycle_repair_station',
                                                            'binoculars',
                                                            'boat_storage',
                                                            'border_control',
                                                            'bus_station',
                                                            'car_sharing',
                                                            'casino',
                                                            'charging_station',
                                                            'clock',
                                                            'compressed_air',
                                                            'customs',
                                                            'device_charging_station',
                                                            'dog_parking',
                                                            'drinking_water',
                                                            'driver_training',
                                                            'events_venue',
                                                            'ferry_terminal',
                                                            'fire_station',
                                                            'fountain',
                                                            'funeral_hall',
                                                            'game_feeding',
                                                            'grave_yard',
                                                            'grit_bin',
                                                            'hunting_stand',
                                                            'kitchen',
                                                            'letter_box',
                                                            'library_dropoff',
                                                            'locker',
                                                            'lounger',
                                                            'marketplace',
                                                            'motorcycle_parking',
                                                            'nursing_home',
                                                            'parcel_locker',
                                                            'parking',
                                                            'parking_space',
                                                            'parking_entrance',
                                                            'pier',
                                                            'place_of_mourning',
                                                            'post_box',
                                                            'prison',
                                                            'public_bath',
                                                            'public_bookcase',
                                                            'reception_desk',
                                                            'recycling',
                                                            'rescue_station',
                                                            'sanitary_dump_station',
                                                            'shower',
                                                            'sink',
                                                            'smoking_area',
                                                            'social_centre',
                                                            'social_facility',
                                                            'stage',
                                                            'stripclub',
                                                            'swimming_pool',
                                                            'taxi',
                                                            'telephone',
                                                            'toilets',
                                                            'training',
                                                            'trolley_bay',
                                                            'vending_machine',
                                                            'waste_basket',
                                                            'waste_disposal',
                                                            'water_point',

                                                            'bureau_de_change',
                                                            'ice_cream',
                                                            'shelter',
                                                            'bbq',
                                                            'festival_grounds',
                                                            'dressing_room',
                                                            'waste_transfer_station',
                                                            'ranger_station',
                                                            'driving_school',
                                                            'veterinary',
                                                            'community_centre',
                                                            'vehicle_inspection',
                                                            'crematorium',
                                                            'animal_training',
                                                            'weighbridge',
                                                            'studio',
                                                            'vacuum_cleaner',
                                                            'watering_place',
                                                            'loading_dock',
                                                            'gambling')
                    and (shelter_type is null or (shelter_type not in ('public_transport', 'lean_to')))
                   )
                or highway = 'speed_camera'
                or (shop is not null and shop not in ('yes', 'pawnbroker', 'funeral_directors', 'weapons', 'laundry', 'garden_centre', 'bookmaker', 'e-cigarette', 'cosmetics', 'clothes', 'hairdresser_supply', 'ticket', 'lottery', 'outpost', 'tobacco', 'jewelry', 'vacant'))
                or office is not null
                or ("natural" in ('stone', 'spring', 'tree') and name is not null)
                )
            union all
            select osm_id
                  ,'p'
                  ,coalesce("name:lt", name, operator) AS name
                  ,description
                  ,information
                  ,image
                  ,opening_hours
                  ,coalesce("contact:phone", phone) phone
                  ,coalesce("contact:email", email) email
                  ,coalesce("contact:website", website) website
                  ,url
                  ,"addr:city"
                  ,"addr:street"
                  ,"addr:postcode"
                  ,"addr:housenumber"
                  ,real_ale
                  ,historic
                  ,man_made
                  ,"tower:type"
                  ,fee
                  ,ref
                  ,coalesce(wikipedia, "subject:wikipedia") AS wikipedia
                  ,"wikipedia:lt"
                  ,"wikipedia:en"
                  ,height
                  ,alt_name
                  ,"ref:lt:kpd"
                  ,maxspeed
                  ,operator
                  ,tourism
                  ,archaeological_site site_type
                  ,amenity
                  ,fireplace
                  ,highway
                  ,access
                  ,shop
                  ,null
                  ,null
                  ,religion
                  ,denomination
                  ,office
                  ,official_name
                  ,null
                  ,null
                  ,"natural"
                  ,round(cast(st_x(st_transform(st_centroid(way), 4326)) as numeric), 4)
                  ,round(cast(st_y(st_transform(st_centroid(way), 4326)) as numeric), 4)
                  ,st_centroid(st_transform(way,4326)) as way
              from planet_osm_polygon
             where ((tourism is not null and tourism not in ('artwork', 'camp_pitch') and (tourism != 'information' or information = 'office') and coalesce(subitem, 'no') != 'yes')
                or (historic is not null and
                    historic not in ('wayside_cross', 'wayside_shrine', 'boundary_stone', 'yes', 'building', 'tomb', 'memorial', 'pillory', 'aircraft'))
                or "ref:lt:kpd" is not null
                or (amenity is not null and amenity not in ('baby_hatch',
                                                            'bench',
                                                            'bicycle_parking',
                                                            'bicycle_repair_station',
                                                            'binoculars',
                                                            'boat_storage',
                                                            'border_control',
                                                            'bus_station',
                                                            'car_sharing',
                                                            'casino',
                                                            'charging_station',
                                                            'clock',
                                                            'compressed_air',
                                                            'customs',
                                                            'device_charging_station',
                                                            'dog_parking',
                                                            'drinking_water',
                                                            'driver_training',
                                                            'events_venue',
                                                            'ferry_terminal',
                                                            'fire_station',
                                                            'fountain',
                                                            'funeral_hall',
                                                            'game_feeding',
                                                            'grave_yard',
                                                            'grit_bin',
                                                            'hunting_stand',
                                                            'kitchen',
                                                            'library_dropoff',
                                                            'letter_box',
                                                            'locker',
                                                            'lounger',
                                                            'marketplace',
                                                            'motorcycle_parking',
                                                            'nursing_home',
                                                            'parcel_locker',
                                                            'parking',
                                                            'parking_space',
                                                            'parking_entrance',
                                                            'pier',
                                                            'place_of_mourning',
                                                            'post_box',
                                                            'prison',
                                                            'public_bath',
                                                            'reception_desk',
                                                            'recycling',
                                                            'rescue_station',
                                                            'sanitary_dump_station',
                                                            'shower',
                                                            'sink',
                                                            'smoking_area',
                                                            'social_centre',
                                                            'social_facility',
                                                            'stage',
                                                            'stripclub',
                                                            'swimming_pool',
                                                            'taxi',
                                                            'telephone',
                                                            'toilets',
                                                            'training',
                                                            'trolley_bay',
                                                            'vending_machine',
                                                            'waste_basket',
                                                            'waste_disposal',
                                                            'water_point',

                                                            'bureau_de_change',
                                                            'ice_cream',
                                                            'shelter',
                                                            'bbq',
                                                            'festival_grounds',
                                                            'dressing_room',
                                                            'waste_transfer_station',
                                                            'ranger_station',
                                                            'driving_school',
                                                            'veterinary',
                                                            'community_centre',
                                                            'vehicle_inspection',
                                                            'crematorium',
                                                            'animal_training',
                                                            'weighbridge',
                                                            'studio',
                                                            'vacuum_cleaner',
                                                            'watering_place',
                                                            'loading_dock',
                                                            'gambling')
                    and (shelter_type is null or (shelter_type not in ('public_transport', 'lean_to')))
                   )
                or highway = 'speed_camera'
                or (shop is not null and shop not in ('yes', 'pawnbroker', 'funeral_directors', 'weapons', 'laundry', 'garden_centre', 'bookmaker', 'e-cigarette', 'cosmetics', 'clothes', 'hairdresser_supply', 'ticket', 'lottery', 'outpost', 'tobacco', 'jewelry', 'vacant'))
                or office is not null
                or ("natural" in ('stone', 'spring', 'tree') and name is not null)
                )
                and coalesce(subitem, 'no') != 'yes'
            union all
            select osm_id
                  ,'p'
                  ,coalesce("name:lt", name, operator) AS name
                  ,description
                  ,information
                  ,image
                  ,opening_hours
                  ,coalesce("contact:phone", phone) phone
                  ,coalesce("contact:email", email) email
                  ,coalesce("contact:website", website) website
                  ,url
                  ,"addr:city"
                  ,"addr:street"
                  ,"addr:postcode"
                  ,"addr:housenumber"
                  ,real_ale
                  ,historic
                  ,man_made
                  ,"tower:type"
                  ,fee
                  ,ref
                  ,coalesce(wikipedia, "subject:wikipedia") AS wikipedia
                  ,"wikipedia:lt"
                  ,"wikipedia:en"
                  ,height
                  ,alt_name
                  ,"ref:lt:kpd"
                  ,maxspeed
                  ,operator
                  ,tourism
                  ,archaeological_site site_type
                  ,amenity
                  ,fireplace
                  ,highway
                  ,access
                  ,shop
                  ,null
                  ,null
                  ,religion
                  ,denomination
                  ,office
                  ,official_name
                  ,null
                  ,null
                  ,"natural"
                  ,round(cast(st_x(st_transform(st_centroid(way), 4326)) as numeric), 4)
                  ,round(cast(st_y(st_transform(st_centroid(way), 4326)) as numeric), 4)
                  ,st_centroid(st_transform(way,4326)) as way
              from planet_osm_line
             where ((tourism is not null and tourism not in ('artwork', 'camp_pitch') and (tourism != 'information' or information = 'office') and coalesce(subitem, 'no') != 'yes')
                or (historic is not null and
                    historic not in ('wayside_cross', 'wayside_shrine', 'boundary_stone', 'yes', 'building', 'tomb', 'memorial', 'railway', 'pillory', 'aircraft'))
                or "ref:lt:kpd" is not null
                or (amenity is not null and amenity not in ('baby_hatch',
                                                            'bench',
                                                            'bicycle_parking',
                                                            'bicycle_repair_station',
                                                            'binoculars',
                                                            'border_control',
                                                            'bus_station',
                                                            'casino',
                                                            'charging_station',
                                                            'clock',
                                                            'compressed_air',
                                                            'customs',
                                                            'device_charging_station',
                                                            'dog_parking',
                                                            'drinking_water',
                                                            'driver_training',
                                                            'events_venue',
                                                            'ferry_terminal',
                                                            'fire_station',
                                                            'fountain',
                                                            'funeral_hall',
                                                            'game_feeding',
                                                            'grave_yard',
                                                            'grit_bin',
                                                            'hunting_stand',
                                                            'kitchen',
                                                            'letter_box',
                                                            'library_dropoff',
                                                            'locker',
                                                            'lounger',
                                                            'marketplace',
                                                            'motorcycle_parking',
                                                            'nursing_home',
                                                            'parcel_locker',
                                                            'parking',
                                                            'parking_space',
                                                            'parking_entrance',
                                                            'pier',
                                                            'place_of_mourning',
                                                            'post_box',
                                                            'prison',
                                                            'public_bath',
                                                            'reception_desk',
                                                            'recycling',
                                                            'rescue_station',
                                                            'sanitary_dump_station',
                                                            'shower',
                                                            'sink',
                                                            'smoking_area',
                                                            'social_centre',
                                                            'social_facility',
                                                            'stage',
                                                            'stripclub',
                                                            'swimming_pool',
                                                            'taxi',
                                                            'telephone',
                                                            'toilets',
                                                            'training',
                                                            'trolley_bay',
                                                            'vending_machine',
                                                            'waste_basket',
                                                            'waste_disposal',
                                                            'water_point',

                                                            'bureau_de_change',
                                                            'ice_cream',
                                                            'shelter',
                                                            'bbq',
                                                            'festival_grounds',
                                                            'dressing_room',
                                                            'waste_transfer_station',
                                                            'ranger_station',
                                                            'driving_school',
                                                            'veterinary',
                                                            'community_centre',
                                                            'vehicle_inspection',
                                                            'crematorium',
                                                            'animal_training',
                                                            'weighbridge',
                                                            'studio',
                                                            'vacuum_cleaner',
                                                            'watering_place',
                                                            'loading_dock',
                                                            'gambling')
                    and (shelter_type is null or (shelter_type not in ('public_transport', 'lean_to')))
                   )
                or highway = 'speed_camera'
                or (shop is not null and shop not in ('yes', 'pawnbroker', 'funeral_directors', 'weapons', 'laundry', 'garden_centre', 'bookmaker', 'e-cigarette', 'cosmetics', 'clothes', 'hairdresser_supply', 'ticket', 'lottery', 'outpost', 'tobacco', 'jewelry', 'vacant'))
                or office is not null)
            ) loop
    l_count := l_count + 1;
    if l_count % 1000 = 0 then
      raise notice '%', l_count;
    end if;

    select count(1)
      into l_existing
      from places.poi
     where osm_id = c.osm_id
       and obj_type = c.obj_type;
    --raise notice 'Found existing poi type %, count %', c.obj_type, l_existing;

    if l_existing = 1 then
      update places.poi set x = 'Y' where osm_id = c.osm_id and obj_type = c.obj_type;

      --raise notice 'Pre name=% obj=% %', l_poi.name, c.obj_type, c.osm_id;
      select p.*
        into l_poi
        from places.poi p
       where p.osm_id = c.osm_id
         and p.obj_type = c.obj_type;
      --raise notice 'Existing name=% new name=%', l_poi.name, c.name;

      if coalesce(c.name, '@') != coalesce(l_poi.attr->>'name', '@') or
         coalesce(c.description, '@') != coalesce(l_poi.attr->>'description', '@') or
         coalesce(c.information, '@') != coalesce(l_poi.attr->>'information', '@') or
         coalesce(c.image, '@') != coalesce(l_poi.attr->>'image', '@') or
         coalesce(c.opening_hours, '@') != coalesce(l_poi.attr->>'opening_hours', '@') or
         coalesce(c.phone, '@') != coalesce(l_poi.attr->>'phone', '@') or
         coalesce(c.email, '@') != coalesce(l_poi.attr->>'email', '@') or
         coalesce(c.website, '@') != coalesce(l_poi.attr->>'website', '@') or
         coalesce(c.url, '@') != coalesce(l_poi.attr->>'url', '@') or
         coalesce(c."addr:city", '@') != coalesce(l_poi.attr->>'addr:city', '@') or
         coalesce(c."addr:street", '@') != coalesce(l_poi.attr->>'addr:street', '@') or
         coalesce(c."addr:postcode", '@') != coalesce(l_poi.attr->>'addr:postcode', '@') or
         coalesce(c."addr:housenumber", '@') != coalesce(l_poi.attr->>'addr:housenumber', '@') or
         coalesce(c.real_ale, '@') != coalesce(l_poi.attr->>'real_ale', '@') or
         coalesce(c.historic, '@') != coalesce(l_poi.attr->>'historic', '@') or
         coalesce(c.man_made, '@') != coalesce(l_poi.attr->>'man_made', '@') or
         coalesce(c."tower:type", '@') != coalesce(l_poi.attr->>'tower:type', '@') or
         coalesce(c.fee, '@') != coalesce(l_poi.attr->>'fee', '@') or
         coalesce(c.ref, '@') != coalesce(l_poi.attr->>'ref', '@') or
         coalesce(c.wikipedia, '@') != coalesce(l_poi.attr->>'wikipedia', '@') or
         coalesce(c."wikipedia:lt", '@') != coalesce(l_poi.attr->>'wikipedia:lt', '@') or
         coalesce(c."wikipedia:en", '@') != coalesce(l_poi.attr->>'wikipedia:en', '@') or
         coalesce(c.height, '@') != coalesce(l_poi.attr->>'height', '@') or
         coalesce(c.alt_name, '@') != coalesce(l_poi.attr->>'alt_name', '@') or
         coalesce(c."ref:lt:kpd", '@') != coalesce(l_poi.attr->>'ref:lt:kpd', '@') or
         coalesce(c.maxspeed, '@') != coalesce(l_poi.attr->>'maxspeed', '@') or
         coalesce(c.operator, '@') != coalesce(l_poi.attr->>'operator', '@') or
         coalesce(c.tourism, '@') != coalesce(l_poi.attr->>'tourism', '@') or
         coalesce(c.site_type, '@') != coalesce(l_poi.attr->>'site_type', '@') or
         coalesce(c.amenity, '@') != coalesce(l_poi.attr->>'amenity', '@') or
         coalesce(c.fireplace, '@') != coalesce(l_poi.attr->>'fireplace', '@') or
         coalesce(c.highway, '@') != coalesce(l_poi.attr->>'highway', '@') or
         coalesce(c.access, '@') != coalesce(l_poi.attr->>'access', '@') or
         coalesce(c.shop, '@') != coalesce(l_poi.attr->>'shop', '@') or
         coalesce(c.whitewater, '@') != coalesce(l_poi.attr->>'whitewater', '@') or
         coalesce(c.milestone, '@') != coalesce(l_poi.attr->>'milestone', '@') or
         coalesce(c.religion, '@') != coalesce(l_poi.attr->>'religion', '@') or
         coalesce(c.denomination, '@') != coalesce(l_poi.attr->>'denomination', '@') or
         coalesce(c.office, '@') != coalesce(l_poi.attr->>'office', '@') or
         coalesce(c.official_name, '@') != coalesce(l_poi.attr->>'official_name', '@') or
         coalesce(c."attraction:type", '@') != coalesce(l_poi.attr->>'attraction:type', '@') or
         coalesce(c.distance, '@') != coalesce(l_poi.attr->>'distance', '@') or
         coalesce(c."natural", '@') != coalesce(l_poi.attr->>'natural', '@') or
         st_distance(c.geom, l_poi.geom) > 10
      then
        raise notice 'POI % % data has changed! Distance: %m', c.obj_type, c.osm_id, round(st_distance(c.geom, l_poi.geom));
        insert into places.poi_change(osm_id
                              ,obj_type
                              ,attr
                              ,uid
                              ,name
                              ,description
                              ,information
                              ,image
                              ,opening_hours
                              ,phone
                              ,email
                              ,website
                              ,url
                              ,"addr:city"
                              ,"addr:street"
                              ,"addr:postcode"
                              ,"addr:housenumber"
                              ,real_ale
                              ,historic
                              ,man_made
                              ,"tower:type"
                              ,fee
                              ,ref
                              ,wikipedia
                              ,"wikipedia:lt"
                              ,"wikipedia:en"
                              ,height
                              ,alt_name
                              ,"ref:lt:kpd"
                              ,maxspeed
                              ,operator
                              ,tourism
                              ,site_type
                              ,amenity
                              ,fireplace
                              ,highway
                              ,access
                              ,shop
                              ,whitewater
                              ,milestone
                              ,religion
                              ,denomination
                              ,office
                              ,official_name
                              ,"attraction:type"
                              ,distance
                              ,"natural"
                              ,lat
                              ,lon
                              ,x_type
                              ,geom
                              )
                       values (c.osm_id
                              ,c.obj_type
                              ,places.create_attr(c)
                              ,l_poi.uid
                              ,c.name
                              ,c.description
                              ,c.information
                              ,c.image
                              ,c.opening_hours
                              ,c.phone
                              ,c.email
                              ,c.website
                              ,c.url
                              ,c."addr:city"
                              ,c."addr:street"
                              ,c."addr:postcode"
                              ,c."addr:housenumber"
                              ,c.real_ale
                              ,c.historic
                              ,c.man_made
                              ,c."tower:type"
                              ,c.fee
                              ,c.ref
                              ,c.wikipedia
                              ,c."wikipedia:lt"
                              ,c."wikipedia:en"
                              ,c.height
                              ,c.alt_name
                              ,c."ref:lt:kpd"
                              ,c.maxspeed
                              ,c.operator
                              ,c.tourism
                              ,c.site_type
                              ,c.amenity
                              ,c.fireplace
                              ,c.highway
                              ,c.access
                              ,c.shop
                              ,c.whitewater
                              ,c.milestone
                              ,c.religion
                              ,c.denomination
                              ,c.office
                              ,c.official_name
                              ,c."attraction:type"
                              ,c.distance
                              ,c."natural"
                              ,c.lat
                              ,c.lon
                              ,'C'
                              ,c.geom
                              );
      end if;
    else
      raise notice 'NEW POI % %!', c.obj_type, c.osm_id;
        insert into places.poi_change(osm_id
                              ,obj_type
                              ,attr
                              ,name
                              ,description
                              ,information
                              ,image
                              ,opening_hours
                              ,phone
                              ,email
                              ,website
                              ,url
                              ,"addr:city"
                              ,"addr:street"
                              ,"addr:postcode"
                              ,"addr:housenumber"
                              ,real_ale
                              ,historic
                              ,man_made
                              ,"tower:type"
                              ,fee
                              ,ref
                              ,wikipedia
                              ,"wikipedia:lt"
                              ,"wikipedia:en"
                              ,height
                              ,alt_name
                              ,"ref:lt:kpd"
                              ,maxspeed
                              ,operator
                              ,tourism
                              ,site_type
                              ,amenity
                              ,fireplace
                              ,highway
                              ,access
                              ,shop
                              ,whitewater
                              ,milestone
                              ,religion
                              ,denomination
                              ,office
                              ,official_name
                              ,"attraction:type"
                              ,distance
                              ,"natural"
                              ,lat
                              ,lon
                              ,x_type
                              ,geom
                              )
                       values (c.osm_id
                              ,c.obj_type
                              ,places.create_attr(c)
                              ,c.name
                              ,c.description
                              ,c.information
                              ,c.image
                              ,c.opening_hours
                              ,c.phone
                              ,c.email
                              ,c.website
                              ,c.url
                              ,c."addr:city"
                              ,c."addr:street"
                              ,c."addr:postcode"
                              ,c."addr:housenumber"
                              ,c.real_ale
                              ,c.historic
                              ,c.man_made
                              ,c."tower:type"
                              ,c.fee
                              ,c.ref
                              ,c.wikipedia
                              ,c."wikipedia:lt"
                              ,c."wikipedia:en"
                              ,c.height
                              ,c.alt_name
                              ,c."ref:lt:kpd"
                              ,c.maxspeed
                              ,c.operator
                              ,c.tourism
                              ,c.site_type
                              ,c.amenity
                              ,c.fireplace
                              ,c.highway
                              ,c.access
                              ,c.shop
                              ,c.whitewater
                              ,c.milestone
                              ,c.religion
                              ,c.denomination
                              ,c.office
                              ,c.official_name
                              ,c."attraction:type"
                              ,c.distance
                              ,c."natural"
                              ,c.lat
                              ,c.lon
                              ,'N'
                              ,c.geom
                              );
    end if;
  end loop;
  raise notice 'Done, total number of POI - %', l_count;

  for c in (select *
              from places.poi
             where x is null) loop
    raise notice 'DELTED POI % %', c.obj_type, c.osm_id;
    insert into places.poi_change(osm_id
                          ,obj_type
                          ,uid
                          ,x_type
                          ,geom
                          )
                   values (c.osm_id
                          ,c.obj_type
                          ,c.uid
                          ,'D'
                          ,c.geom
                          );
  end loop;

  return 'OK';
end
$$ language plpgsql;

select places.process_poi_change();
