create or replace function error50() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 50'';
  delete from errors where source = ''lt'' and error_type = 1050;
  for c in (select osm_id osm_id
                  ,osm_timestamp
                  ,''missing tracktype'' descr
                  ,st_x(st_transform(st_startpoint(way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_startpoint(way), 4326)) * 1000000 as lat
              from planet_osm_line
             where highway = ''track''
               and ((tracktype is null) or
                    (tracktype = ''grade1'' and surface is null) or
                    (tracktype = ''grade1'' and surface not in (''paved'', ''asphalt'')) or
                    (tracktype != ''grade1'' and surface in (''paved'', ''asphalt''))
                   )
             limit 10
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
      1050, -- error_type
      ''tracktype'', -- error_name
      ''way'', -- object_type
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
