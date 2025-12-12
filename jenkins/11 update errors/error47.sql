create or replace function error47() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 47'';
  delete from errors where source = ''lt'' and error_type = 1047;
  for c in (select d.osm_id osm_id
                  ,d.osm_timestamp
                  ,d.osm_user
                  ,''užtvanka negali eiti tvenkinio kraštu'' descr
              from planet_osm_line d
                  ,planet_osm_polygon w
             where d.waterway = ''dam''
               and w.landuse = ''reservoir''
               and st_touches(w.way, d.way)
               and d.osm_id not in (672894782, 753666282, 670297560, 603971469)
             limit 10
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
      1047, -- error_type
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
