create or replace function error29() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1029;
  for c in (select ''node'' typ,
                   p.osm_id,
                   p.osm_timestamp,
                   st_x(st_transform(p.way, 4326)) * 1000000 as lon,
                   st_y(st_transform(p.way, 4326)) * 1000000 as lat,
                   ''Nepilnas adresas'' descr
              from planet_osm_point p
             where (("addr:street" is not null
               and "addr:housenumber" is null)
                   or
                   ("addr:city" is not null
               and  "addr:housenumber" is null))
               and "addr:approximate" is null
            union
            select ''way'' typ,
                   p.osm_id,
                   p.osm_timestamp,
                   st_x(st_transform(st_centroid(p.way), 4326)) * 1000000 as lon,
                   st_y(st_transform(st_centroid(p.way), 4326)) * 1000000 as lat,
                   ''Nepilnas adresas'' descr
              from planet_osm_polygon p
             where (("addr:street" is not null
               and "addr:housenumber" is null)
                   or
                   ("addr:city" is not null
               and  "addr:housenumber" is null))
               and "addr:approximate" is null
           order by 1, 2
           limit 10
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
      lat,
      lon,
      object_timestamp
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1029, -- error_type
      ''nepilnas adresas'', -- error_name
      c.typ, -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      c.lat,
      c.lon,
      now() --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
    );
  end loop;
end' language plpgsql;
