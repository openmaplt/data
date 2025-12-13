create or replace function error37() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1037;
  for c in (select osm_id
                  ,osm_timestamp
                  ,''nuimti layer arba pridėti tunnel'' descr
              from planet_osm_line
             where waterway is not null
               and layer = ''-1''
               and tunnel is null
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
      null, -- schema
      nextval(''error_seq''), -- error_id
      1037, -- error_type
      ''bad layer/tunnel'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now()  --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
    );
  end loop;
end' language plpgsql;
