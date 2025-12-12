create or replace function error05() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 05'';
  delete from errors where source = ''lt'' and error_type = 1005;
  for c in (select osm_id, osm_timestamp, osm_user, p."addr:housenumber" as number
                  ,st_x(st_transform(p.way, 4326)) * 1000000 as lon
                  ,st_y(st_transform(p.way, 4326)) * 1000000 as lat
              from planet_osm_point p
             where p."addr:housenumber" is not null
               and length(translate(p."addr:housenumber", ''1234567890ABCDEFGHIYJKLMNOPQRSTUVZXW'', '''')) > 0
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
      lon,
      lat,
      object_timestamp,
      user_name
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      -5, -- error_type
      ''incorrect number'', -- error_name
      ''node'', -- object_type
      c.osm_id, -- object_id
      ''neteisingas namo numeris '' || c.number, -- description
      c.osm_timestamp,
      now(),
      c.lon,
      c.lat,
      c.osm_timestamp,
      c.osm_user
    );
  end loop;
end' language plpgsql;
