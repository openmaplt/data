create or replace function error42() returns void
as '
declare
  c record;
  i real;
begin
  raise notice ''Starting calculation of error 42'';
  delete from errors where source = ''lt'' and error_type = 1042;
  for c in (select p.osm_id osm_id
                  ,p.osm_timestamp
                  ,st_length(way) as ilgis
                  ,way
              from planet_osm_line p
             where p.man_made = ''cutline''
               and not exists (select 1
                                 from planet_osm_polygon l
                                where st_contains(l.way, p.way)
                                  and (l.landuse in (''forest'') or l."natural" in (''wetland'', ''sand'')))
            ) loop
    select sum(st_length(st_intersection(c.way, p.way)))
      into i
      from planet_osm_polygon p
     where p.landuse = ''forest''
        or p."natural" in (''wetland'', ''sand'');
    if i + 1 < c.ilgis then
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
        1042, -- error_type
        ''topology error'', -- error_name
        ''way'', -- object_type
        c.osm_id, -- object_id
       ''cutline virš miško/pelkės trūksta '' || floor(c.ilgis - i) || ''m.'', -- description
        c.osm_timestamp,
        now(),
        c.osm_timestamp
      );
    end if;
  end loop;
end' language plpgsql;
