create or replace function error11() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 11'';
  delete from errors where source = ''lt'' and error_type = 1011;
  for c in (select osm_id, osm_timestamp
              from planet_osm_line p
             where p.oneway is null
               and coalesce(p.highway, ''-'') in (''motorway_link'', ''trunk_link'', ''primary_link'', ''secondary_link'')
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
      object_timestamp
    ) values (
      ''lt'', -- source
      null,
      nextval(''error_seq''), -- error_id
      1011, -- error_type
      ''no oneway tag'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''nėra oneway žymos'', -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now()  --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"'')
    );
  end loop;
end' language plpgsql;
