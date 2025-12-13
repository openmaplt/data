create or replace function error19() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 19'';
  delete from errors where source = ''lt'' and error_type = 1019;
  for c in (select p1.osm_id osm_id
                  ,p1.osm_timestamp
                  ,''panaikinti persidengimą '' || coalesce(p1.landuse, p1.natural, p1.waterway) || ''-'' || coalesce(p2.landuse, p2.natural, p2.waterway) || '' su poligonu '' || p2.osm_id descr
              from planet_osm_polygon p1
                  ,planet_osm_polygon p2
             where (st_overlaps(p1.way, p2.way) or st_contains(p1.way, p2.way) or st_contains(p2.way, p1.way))
               and st_dwithin(p1.way, p2.way, 1)
               and (p1.landuse in (''forest'', ''meadow'', ''farmland'', ''reservoir'', ''residential'', ''commercial'', ''industrial'', ''allotments'', ''farmyard'') or p1.natural in (''water'', ''wetland'', ''scrub'', ''heath'') or (p1.waterway = ''riverbank''))
               and (p2.landuse in (''forest'', ''meadow'', ''farmland'', ''reservoir'', ''residential'', ''commercial'', ''industrial'', ''allotments'', ''farmyard'') or p2.natural in (''water'', ''wetland'', ''scrub'', ''heath'') or (p2.waterway = ''riverbank''))
               and coalesce(p1.wetland, ''!@#'') != ''reedbed''
               and coalesce(p2.wetland, ''!@#'') != ''reedbed''
               and p1.osm_id < p2.osm_id
               and p1.landcover is null
               and p2.landcover is null
            limit 20) loop
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
      1019, -- error_type
      ''overlapping polygons'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
