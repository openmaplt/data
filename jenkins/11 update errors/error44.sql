create or replace function error44() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1044;
  for c in (select osm_id
                  ,osm_timestamp
                  ,''galimi tik skaitmenys'' descr
                  ,''way'' typ
              from planet_osm_polygon
             where (translate(height, ''m '', '''') != height or
                    translate("building:height", ''m '', '''') != "building:height")
               and osm_id not in (-1)
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
      1044, -- error_type
      ''incorrect number'', -- error_name
      c.typ, -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now()  --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
    );
  end loop;
end' language plpgsql;
