create or replace function error24() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1024;
  for c in (select ''node'' typ, p.osm_id, p.osm_timestamp
                  ,p."addr:city" || '' '' || p."addr:street" || '' '' || p."addr:housenumber" || '' už ribų'' descr
                  ,st_x(st_transform(p.way, 4326)) * 1000000 as lon
                  ,st_y(st_transform(p.way, 4326)) * 1000000 as lat
              from planet_osm_point p,
                   (select a.name
                          ,st_union(a.way) way
                      from planet_osm_polygon a
                     where a.boundary = ''administrative''
                       and a.admin_level = ''8''
                    group by 1) b
             where p."addr:city" is not null
               and not st_within(p.way, b.way)
               and b.name = p."addr:city"
               and p.osm_id not in (
                 727292667   -- Akademijos adresas ne Akademijos miestelyje...
                 ,1891414247 -- Akademijos adresas ne Akademijos miestelyje...
                 ,739995494  -- Akademijos adresas ne Akademijos miestelyje...
                 ,2754556671 -- Kanapelkos teritorijoje Molėtų adresai
                 ,436619945  -- Kanapelkos teritorijoje Molėtų adresai
                 ,849352405  -- Kanapelkos teritorijoje Molėtų adresai
               )
            union
            select ''way'' typ, p.osm_id, p.osm_timestamp
                  ,p."addr:city" || '' '' || p."addr:street" || '' '' || p."addr:housenumber" || '' už ribų'' descr
                  ,st_x(st_transform(st_centroid(p.way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(p.way), 4326)) * 1000000 as lat
              from planet_osm_polygon p,
                   (select a.name
                          ,st_union(a.way) way
                      from planet_osm_polygon a
                     where a.boundary = ''administrative''
                       and a.admin_level = ''8''
                    group by 1) b
             where p."addr:city" is not null
               and not st_within(p.way, b.way)
               and b.name = p."addr:city"
               and p.osm_id not in (
                 25432511   -- VAE
                 ,232572050 -- Kuprioniškės
                 ,153779456 -- Kuprioniškės
                 ,586423380 -- Taurų parkas
               )
            order by 3
            limit 100) loop
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
      1024, -- error_type
      ''address outside place'', -- error_name
      c.typ, -- object_type
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
