create or replace function error51() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 51'';
  delete from errors where source = ''lt'' and error_type = 1051;
  for c in (select osm_id osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''bad name'' descr
                  ,st_x(st_transform(way, 4326)) * 1000000 as lon
                  ,st_y(st_transform(way, 4326)) * 1000000 as lat
              from planet_osm_point
             where shop is not null
               and name like ''%101%''
               and (name != ''101 kepyklėlė'' or
                    shop != ''bakery'' or
                    coalesce(operator, ''!@#'') != ''UAB „Kalpė“'' or
                    coalesce(email, ''!@#'') != ''uzsakymai@101kepyklele.lt'' or
                    coalesce(website, ''!@#'') != ''https://101kepyklele.lt/'')
             union all
            select osm_id osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''bad name'' descr
                  ,st_x(st_transform(st_centroid(way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(way), 4326)) * 1000000 as lat
              from planet_osm_polygon
             where shop is not null
               and name like ''%101%''
               and (name != ''101 kepyklėlė'' or
                    shop != ''bakery'' or
                    coalesce(operator, ''!@#'') != ''UAB „Kalpė“'' or
                    coalesce(email, ''!@#'') != ''uzsakymai@101kepyklele.lt'' or
                    coalesce(website, ''!@#'') != ''https://www.101kepyklele.lt/'')
             union all

            select osm_id osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''bad name'' descr
                  ,st_x(st_transform(way, 4326)) * 1000000 as lon
                  ,st_y(st_transform(way, 4326)) * 1000000 as lat
              from planet_osm_point
             where amenity is not null
               and lower(name) like ''%ameri%pizza''
               and (name != ''American Pizza'' or
                    amenity != ''fast_food'' or
                    /*coalesce(cuisine, ''!@#'') != ''pizza'' or*/
                    coalesce(email, ''!@#'') != ''americanpizza@inbox.lt'' or
                    coalesce(website, ''!@#'') != ''https://americanpizza.lt/'')
             union all
            select osm_id osm_id
                  ,osm_timestamp
                  ,osm_user
                  ,''bad name'' descr
                  ,st_x(st_transform(st_centroid(way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(way), 4326)) * 1000000 as lat
              from planet_osm_polygon
             where amenity is not null
               and lower(name) like ''%ameri%pizza''
               and (name != ''American Pizza'' or
                    amenity != ''fast_food'' or
                    /*coalesce(cuisine, ''!@#'') != ''pizza'' or*/
                    coalesce(email, ''!@#'') != ''americanpizza@inbox.lt'' or
                    coalesce(website, ''!@#'') != ''http://americanpizza.lt/'')
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
      1051, -- error_type
      ''comp info'', -- error_name
      ''node'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.lat,
      c.lon,
      c.osm_timestamp,
      c.osm_user
    );
  end loop;
end' language plpgsql;
