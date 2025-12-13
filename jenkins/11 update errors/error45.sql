create or replace function error45() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 45'';
  delete from errors where source = ''lt'' and error_type = 1045;
  for c in (select p.osm_id osm_id
                  ,p.osm_timestamp
                  ,''reedbed tik virš water'' descr
                  ,st_x(st_transform(st_centroid(p.way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(p.way), 4326)) * 1000000 as lat
              from planet_osm_polygon p
             where p.wetland = ''reedbed''
               and not exists (select 1
                                 from planet_osm_polygon l
                                where st_contains(l.way, p.way)
                                  and ("natural" = ''water'' or landuse = ''reservoir'' or waterway = ''riverbank'' or osm_id = -7546467))
               and p.osm_id not in (601995186,170871459)
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
      lon,
      lat,
      object_timestamp
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1045, -- error_type
      ''topology error'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.lon,
      c.lat,
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
