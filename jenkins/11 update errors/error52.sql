create or replace function error52() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 52'';
  delete from errors where source = ''lt'' and error_type = 1052;
  for c in (select osm_id osm_id
                  ,osm_timestamp
                  ,''bad name'' descr
                  ,''node'' object_type
                  ,st_x(st_transform(way, 4326)) * 1000000 as lon
                  ,st_y(st_transform(way, 4326)) * 1000000 as lat
              from planet_osm_point
             where name = "addr:housenumber"
               and osm_id not in (5292033545 /* Kavinė, kurios pavadinimas kaip namo numeris */ )
             union all
            select osm_id osm_id
                  ,osm_timestamp
                  ,''bad name'' descr
                  ,''way'' object_type
                  ,st_x(st_transform(st_centroid(way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(way), 4326)) * 1000000 as lat
              from planet_osm_polygon
             where name = "addr:housenumber"
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
      object_timestamp
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1052, -- error_type
      ''incorrect_name'', -- error_name
      c.object_type, -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.lat,
      c.lon,
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
