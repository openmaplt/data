create or replace function error15() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1015;
  for c in (select osm_id, osm_timestamp, osm_user
              from planet_osm_line
             where highway in (''primary'', ''primary_link'', ''secondary'', ''secondary_link'', ''tertiary'', ''tertiary_link'')
               and surface is null) loop
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
      1015, -- error_type
      ''missing surface tag'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''nėra dangos informacijos'', -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      c.osm_user
    );
  end loop;
end' language plpgsql;
