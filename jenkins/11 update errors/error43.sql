create or replace function error43() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 43'';
  delete from errors where source = ''lt'' and error_type = 1043;
  for c in (select p.osm_id osm_id
                  ,w.osm_id w_osm_id
                  ,p.osm_timestamp
              from planet_osm_line p
                  ,planet_osm_polygon w
             where p.waterway in (''stream'', ''river'')
               and p.name is not null
               and p."waterway:speed" is null
               and w.name is not null
               and coalesce(p.layer, ''!@#'') != ''-1''
               and ((w."natural" = ''water'' and coalesce(w.water, ''!@$'') != ''river'') or (w.landuse = ''reservoir''))
               and st_length(st_intersection(w.way, p.way)) > 20
               and st_dwithin(w.way, p.way, 1)
               and p.osm_id not in (472074232, 129848757,514520039,284426970)
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
        object_timestamp
      ) values (
        ''lt'', -- source
        null, -- schema
        nextval(''error_seq''), -- error_id
        1043, -- error_type
        ''topology error'', -- error_name
        ''way'', -- object_type
        c.osm_id, -- object_id
       ''upė ežere '' || c.w_osm_id || '' turi turėti žymą waterway:speed=0'', -- description
        c.osm_timestamp,
        now(),
        c.osm_timestamp
      );
  end loop;
end' language plpgsql;
