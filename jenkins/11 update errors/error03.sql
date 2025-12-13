create or replace function error03() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 03'';
  delete from errors where source = ''lt'' and error_type = 1003;
  for c in (select osm_id, osm_timestamp, p."addr:street" as name
                  ,st_x(st_transform(st_centroid(p.way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(p.way), 4326)) * 1000000 as lat
              from planet_osm_polygon p
             where p.building is not null
               and p.osm_id not in (148226088
                                   ,148226092
                                   ,126109790
                                   ,126109791
                                   ,126109809
                                   ,115376949
                                   ,126109796
                                   ,134069839
                                   ,789654698
                                   ,356101818)
               and p."addr:street" is not null
               and p."addr:street" != coalesce(p."addr:city", ''-'')
               and not exists (
                         select 1
                           from planet_osm_line l
                          where l.name = p."addr:street"
                            and l.highway is not null
                            and st_dwithin(p.way, l.way, 5000))
               and not exists (
                         select 1
                           from planet_osm_polygon l
                          where l.name = p."addr:street"
                            and l.highway is not null
                            and st_dwithin(p.way, l.way, 5000))
               and p.osm_id not in (197674096)
               limit 200
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
      1003, -- error_type
      ''street not found'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''adreso gatve '' || c.name || '' nerasta'', -- description
      c.osm_timestamp,
      now(),
      c.lat,
      c.lon,
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
