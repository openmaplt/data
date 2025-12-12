create or replace function error46() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 46'';
  delete from errors where source = ''lt'' and error_type = 1046;
  for c in (select p.osm_id osm_id
                  ,p.osm_timestamp
                  ,p.osm_user
                  ,''mokyklos/darželiai tik virš residential'' descr
              from planet_osm_polygon p
             where p.amenity in (''school'', ''kindergarten'', ''college'', ''hospital'')
               and building is null
               and not exists (select 1
                                 from planet_osm_polygon l
                                where st_contains(l.way, p.way)
                                  and (landuse = ''residential''))
               and osm_id not in (-9944550)
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
      object_timestamp,
      user_name
    ) values (
      ''lt'', -- source
      null, -- schema
      nextval(''error_seq''), -- error_id
      1046, -- error_type
      ''topology error'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.osm_timestamp,
      c.osm_user
    );
  end loop;
end' language plpgsql;
