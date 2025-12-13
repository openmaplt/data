create or replace function error01() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 01'';
  delete from errors where source = ''lt'' and error_type = 1001;
  for c in (select osm_id, osm_timestamp, name
              from planet_osm_point
             where place in (''city'', ''town'')
               and population is null) loop
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
      1001, -- error_type
      ''no population'', -- error_name
      ''node'', -- object_type
      c.osm_id, -- object_id
      ''nenurodytas gyventoju skaicius miestui '' || c.name, -- description
      c.osm_timestamp,
      now(),
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
