create or replace function error12() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 12'';
  delete from errors where source = ''lt'' and error_type = 1012;
  for c in (select osm_id, highway, osm_timestamp
              from planet_osm_line
             where highway not in (''motorway'', ''motorway_link'',
                                   ''trunk'', ''trunk_link'',
                                   ''primary'', ''primary_link'',
                                   ''secondary'', ''secondary_link'',
                                   ''tertiary'', ''tertiary_link'',
                                   ''unclassified'',
                                   ''residential'',
                                   ''service'',
                                   ''path'',
                                   ''track'',
                                   ''road'',
                                   ''footway'',
                                   ''cycleway'',
                                   ''proposed'',
                                   ''raceway'',
                                   ''pedestrian'',
                                   ''bridleway'',
                                   ''rest_area'',
                                   ''construction'',
                                   ''living_street'',
                                   ''steps'',
                                   ''platform'',
                                   ''corridor'',
                                   ''elevator'')) loop
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
      1012, -- error_type
      ''unknown highway'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      ''neaiškus highway'', -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now()  --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"'')
    );
  end loop;
end' language plpgsql;
