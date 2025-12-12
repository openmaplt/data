create or replace function error30() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 30'';
  delete from errors where source = ''lt'' and error_type = 1030;
  for c in (select p.osm_id osm_id
                  ,p.osm_timestamp
                  ,p.osm_user
                  ,''wood tik virš landuse'' descr
              from planet_osm_polygon p
             where (p.natural = ''wood'' or p.landuse = ''religious'')
               and not exists (select 1
                                 from planet_osm_polygon l
                                where st_contains(l.way, p.way)
                                  and (l.landuse in (''residential'', ''commercial'', ''industrial'', ''allotments'', ''farmland'', ''farmyard'', ''retail'', ''garages'', ''brownfield'')))
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
      1030, -- error_type
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
