create or replace function error33() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1033;
  for c in (select osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''neteisingas vamzdžtio objektas (taškas)'' descr
              from planet_osm_point
             where tunnel = ''culvert''
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
      1033, -- error_type
      ''bad culvert object'', -- error_name
      ''node'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      c.osm_user
    );
  end loop;
end' language plpgsql;
