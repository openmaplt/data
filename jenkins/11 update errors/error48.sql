create or replace function error48() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 48'';
  delete from errors where source = ''lt'' and error_type = 1048;
  for c in (select osm_id osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''keisti į landuse=meadow arba landuse=grass+landcover=grass'' descr
              from planet_osm_polygon
             where "natural" = ''grassland'' or
                  (landuse = ''grass'' and landcover is null)
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
      object_timestamp,
      user_name
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1048, -- error_type
      ''weak tag'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.osm_timestamp,
      c.osm_user
    );
  end loop;
end' language plpgsql;
