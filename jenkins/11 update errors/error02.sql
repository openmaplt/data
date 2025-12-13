create or replace function error02() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 02'';
  delete from errors where source = ''lt'' and error_type = 1002;
  for c in (select osm_id, osm_timestamp
              from planet_osm_polygon
             where "natural" = ''wetland''
               and wetland is null) loop
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
      object_timestamp
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1002, -- error_type
      ''unspecified wetland'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''nenurodytas pelkės tipas '', -- description
      c.osm_timestamp,
      now(),
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
