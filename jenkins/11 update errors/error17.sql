create or replace function error17() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1017;
  for c in (select osm_id, osm_timestamp
                  ,st_x(st_transform(st_startpoint(way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_startpoint(way), 4326)) * 1000000 as lat
              from planet_osm_line
             where "addr:street" is not null or "addr:housenumber" is not null
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
      object_timestamp
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1017, -- error_type
      ''address way'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''adresas gatvėje'', -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      c.lon,
      c.lat,
      now()  --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
    );
  end loop;
end' language plpgsql;
