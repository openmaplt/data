create or replace function error34() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1034;
  for c in (select osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''su pavadinimu turi būti upeliukas'' descr
              from planet_osm_line
             where waterway = ''ditch''
               and name is not null
               and name not like ''_-1''
               and name not like ''_-2''
               and osm_id not in (397813907, 957103680)
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
      1034, -- error_type
      ''should be stream'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      c.osm_user
    );
  end loop;
end' language plpgsql;
