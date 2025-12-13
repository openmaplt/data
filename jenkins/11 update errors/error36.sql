create or replace function error36() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 36'';
  delete from errors where source = ''lt'' and error_type = 1036;
  for c in (select p1.osm_id osm_id
                  ,p1.osm_timestamp
                  ,''panaikinti pastatų persidengimą '' || p2.osm_id descr
              from planet_osm_polygon p1
                  ,planet_osm_polygon p2
             where (st_overlaps(p1.way, p2.way) or st_contains(p1.way, p2.way) or st_contains(p2.way, p1.way))
               and p1.building is not null
               and p2.building is not null
               and coalesce(p1.location,''-'') != ''underground''
               and coalesce(p2.location,''-'') != ''underground''
               and st_dwithin(p1.way, p2.way, 1)
               and p1.osm_id < p2.osm_id
               and p1.osm_id not in (-7877669, 24569542)
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
      1036, -- error_type
      ''overlapping buildings'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
