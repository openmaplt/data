create or replace function error38() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1038;
  for c in (select osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''nuimti addr:* žymas nuo highway'' descr
              from planet_osm_line
             where highway is not null
               and (("addr:postcode" is not null) or
                    ("addr:city" is not null) or
                    ("addr:street" is not null)
                   )
               and osm_id not in (217134178)
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
      1038, -- error_type
      ''addr on highway'', -- error_name
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
