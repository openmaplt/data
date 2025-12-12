create or replace function error27() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1027;
  for c in (select ''way'' typ, p.osm_id,  p.osm_timestamp, p.osm_user, ''Pasenęs žymėjimas „farm“'' descr
              from planet_osm_polygon p
             where landuse = ''farm''
           order by 1, 2
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
      1027, -- error_type
      ''deprecated "farm"'', -- error_name
      c.typ, -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      c.osm_user
    );
  end loop;
end' language plpgsql;
