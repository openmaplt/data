create or replace function error08() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 08'';
  delete from errors where source = ''lt'' and error_type = 1008;
  for c in (select osm_id, osm_timestamp, p."addr:housenumber" as number
                  ,st_x(st_transform(st_centroid(p.way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(p.way), 4326)) * 1000000 as lat
              from planet_osm_polygon p
             where p."addr:housenumber" is not null
               and p."addr:street" is null
               and p."addr:nostreet" is null
               and p.osm_id not in (177630708
                                   ,177636270
                                   ,177635334
                                   ,177634237
                                   ,177634344
                                   ,189421283
                                   ,137559542
                                   ,171281038
                                   ,171281044
                                   ,247802836
                                   ,229278955)
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
      1008, -- error_type
      ''no_street'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''nenurodyta gatve'', -- description
      c.osm_timestamp,
      now(),
      c.lon,
      c.lat,
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
