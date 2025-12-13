create or replace function error09() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 09'';
  delete from errors where source = ''lt'' and error_type = 1009;
  for c in (select osm_id, osm_timestamp
                  ,st_x(st_transform(p.way, 4326)) * 1000000 as lon
                  ,st_y(st_transform(p.way, 4326)) * 1000000 as lat
              from planet_osm_point p
             where p.oneway is not null
                or p.junction is not null
                or coalesce(p.tunnel, ''yes'') not in (''yes'', ''culvert'', ''building_passage'')
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
      1009, -- error_type
      ''strange tags'', -- error_name
      ''point'', -- object_type
      c.osm_id, -- object_id
      ''keistos žymos'', -- description
      c.osm_timestamp,
      now(),
      c.lon,
      c.lat,
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
