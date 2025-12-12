create or replace function error04() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculatio of error 04'';
  delete from errors where source = ''lt'' and error_type = 1004;
  for c in (select osm_id, osm_timestamp, osm_user, p."addr:street" as name
                  ,st_x(st_transform(p.way, 4326)) * 1000000 as lon
                  ,st_y(st_transform(p.way, 4326)) * 1000000 as lat
              from planet_osm_point p
             where p.osm_id not in (1883079565
                                   ,1883079557
                                   ,1883079562
                                   ,1940248259
                                   ,2109116565
                                   ,2109116566
                                   ,2109116564
                                   ,1883079564
                                   ,325113057)
               and p."addr:street" is not null
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
      object_timestamp,
      user_name
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1004, -- error_type
      ''street not found'', -- error_name
      ''node'', -- object_type
      c.osm_id, -- object_id
      ''adreso gatve '' || c.name || '' nerasta'', -- description
      c.osm_timestamp,
      now(),
      c.lat,
      c.lon,
      c.osm_timestamp,
      c.osm_user
    );
  end loop;
end' language plpgsql;
