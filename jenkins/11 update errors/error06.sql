create or replace function error06() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 06'';
  delete from errors where source = ''lt'' and error_type = 1006;
  for c in (select osm_id, osm_timestamp, p."addr:housenumber" as number
                  ,st_x(st_transform(st_centroid(p.way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(p.way), 4326)) * 1000000 as lat
              from planet_osm_polygon p
             where p."addr:housenumber" is not null
               and osm_id not in (172177768
                                 ,172178191
                                 ,172178677
                                 ,172178891
                                 ,172640827
                                 ,172640945
                                 ,172952791
                                 ,172952792
                                 ,172952793
                                 ,172952794
                                 ,172953232
                                 ,175699694
                                 ,175699787
                                 ,175703317
                                 ,175703451
                                 ,175703581
                                 ,175703595
                                 ,175703612
                                 ,175704096
                                 ,175704146
                                 ,175704398
                                 ,175704511
                                 ,175704549
                                 ,175704794
                                 ,175703316
                                 ,175703676
                                 )
               and length(translate(p."addr:housenumber", ''1234567890ABCDEFGHIYJKLMNOPQRSTUVXYZW'', '''')) > 0
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
      1006, -- error_type
      ''incorrect number'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''neteisingas namo numeris '' || c.number, -- description
      c.osm_timestamp,
      now(),
      c.lon,
      c.lat,
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
