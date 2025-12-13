create or replace function error49() returns void
as '
declare
  c record;
begin
  raise notice ''Starting calculation of error 49'';
  delete from errors where source = ''lt'' and error_type = 1049;
  for c in (select osm_id osm_id
                  ,osm_timestamp
                  ,''neaiškus maxspeed'' descr
              from planet_osm_line
             where highway is not null
               and maxspeed is not null
               and maxspeed not in (''5'', ''7'', ''8'', ''10'', ''15'', ''20'', ''30'', ''40'', ''50'', ''60'', ''70'', ''80'', ''90'', ''100'', ''110'', ''120'', ''130'', ''LT:urban'', ''LT:rural'')
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
      1049, -- error_type
      ''weak tag'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      c.osm_timestamp,
      now(),
      c.osm_timestamp
    );
  end loop;
end' language plpgsql;
