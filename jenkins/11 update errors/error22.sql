create or replace function error22() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1022;
  for c in (select osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''kelias turi ref žymą, bet nėra motorway, primary, secondary ar tertiary. reikia pakeisti klasifikaciją arba nuimti ref žymą'' descr
              from planet_osm_line
             where ref is not null
               and highway is not null
               and highway not in (''motorway'', ''motorway_link'', ''trunk'', ''trunk_link'', ''primary'', ''primary_link'', ''secondary'', ''secondary_link'', ''tertiary'', ''tertiary_link'', ''construction'', ''proposed'')
               and admin_level is null -- boundaries in russia have ref
               and route is null
               and railway is null
               and aeroway is null) loop
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
      1022, -- error_type
      ''incorrect classification'', -- error_name
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
