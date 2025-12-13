create or replace function error54() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 54'';
  delete from errors where source = ''lt'' and error_type = 1054;
  for c in (select osm_id osm_id
                  ,osm_timestamp
                  ,''multi-outer'' descr
                  ,''relation'' object_type
                  ,st_x(st_transform(st_centroid(way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(way), 4326)) * 1000000 as lat
              from planet_osm_polygon
             where osm_id < 0
               and landuse in (''residential'', ''forest'', ''farmland'', ''meadow'', ''commercial'', ''industrial'', ''grass'', ''basin'')
               and (st_nrings(way) - coalesce(st_numinteriorrings(way), 0)) > 1
               and name is null
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
      1054, -- error_type
      ''multi-outer'', -- error_name
      c.object_type, -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.lat,
      c.lon,
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
