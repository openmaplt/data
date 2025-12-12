create or replace function error53() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 53'';
  delete from errors where source = ''lt'' and error_type = 1053;
  for c in (select osm_id osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''bad address'' descr
                  ,''node'' object_type
                  ,st_x(st_transform(way, 4326)) * 1000000 as lon
                  ,st_y(st_transform(way, 4326)) * 1000000 as lat
              from planet_osm_point
             where osm_id not in (0 /*  */ )
               and "addr:housenumber" is not null
               and (
                    ("addr:place" is not null and "addr:street" is not null) or
                    ("addr:nostreet" is not null and "addr:street" is not null) or
                    ("addr:place" is not null and "addr:place" != "addr:city") or
                    ("addr:street" is null and "addr:place" is null)
                   )
             union all
            select osm_id osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''bad address'' descr
                  ,''way'' object_type
                  ,st_x(st_transform(st_centroid(way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(way), 4326)) * 1000000 as lat
              from planet_osm_polygon
             where osm_id not in (0 /*  */ )
               and "addr:housenumber" is not null
               and (
                    ("addr:place" is not null and "addr:street" is not null) or
                    ("addr:nostreet" is not null and "addr:street" is not null) or
                    ("addr:place" is not null and "addr:place" != "addr:city") or
                    ("addr:street" is null and "addr:place" is null)
                   )
            ) loop
    insert into errors (
      source,
      schema,
      error_id,
      error_type,
      error_name,
      object_type,
      object_id,
      description,
      first_occurrence,
      last_checked,
      lat,
      lon,
      object_timestamp,
      user_name
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1053, -- error_type
      ''incorrect_address'', -- error_name
      c.object_type, -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.lat,
      c.lon,
      c.osm_timestamp,
      c.osm_user
    );
  end loop;
end' language plpgsql;
