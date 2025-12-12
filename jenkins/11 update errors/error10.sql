create or replace function error10() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 10'';
  delete from errors where source = ''lt'' and error_type = 1010;
  for c in (select osm_id, osm_timestamp, osm_user
                  ,st_x(st_transform(st_centroid(p.way), 4326)) * 1000000 as lon
                  ,st_y(st_transform(st_centroid(p.way), 4326)) * 1000000 as lat
              from planet_osm_line p
             where (coalesce(p.tunnel, ''yes'') not in (''yes'', ''culvert'', ''building_passage'')
                or (coalesce(p.bridge, ''no'') = ''yes'' and coalesce(p.layer, ''0'') not in (''1'', ''2''))
                or (coalesce(p.tunnel, ''no'') = ''yes'' and coalesce(p.layer, ''x'') not in (''-1'', ''-2'', ''0''))
                or building is not null
                or (p.tracktype is not null and (highway not in (''track'', ''proposed'')))
                or (p.name is not null and highway = ''service'')
                or (p.service is not null and highway not in (''service'', ''proposed'', ''construction''))
                ) and osm_id not in (362943647,493464575,285188571,528381657,438276551,435430777,466684595,438276552,229773763)
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
      object_timestamp,
      user_name
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1010, -- error_type
      ''strange tags'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''keistos žymos'', -- description
      c.osm_timestamp,
      now(),
      c.lon,
      c.lat,
      c.osm_timestamp,
      c.osm_user
    );
  end loop;
end' language plpgsql;
