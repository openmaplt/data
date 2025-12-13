create or replace function error20() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1020;
  for c in (select osm_id
                  ,osm_timestamp
                  ,''danga yra "'' || surface || ''", o kelias pažymėtas "tertiary", turi būti "secondary" arba danga kitokia'' descr
              from planet_osm_line
             where highway = ''tertiary''
               and coalesce(surface, ''unpaved'') not in (''unpaved'', ''gravel'', ''gravel;sand'', ''compacted'',''ground'',''dirt'',''compacted;washboard'', ''sand'', ''fine_gravel'')
               and not ((st_within(way, (select way from planet_osm_polygon where osm_id = -968952))) or (st_crosses(way, (select way from planet_osm_polygon where osm_id = -968952)))) --Vilnius
               and not ((st_within(way, (select way from planet_osm_polygon where osm_id = -1067534))) or (st_crosses(way, (select way from planet_osm_polygon where osm_id = -1067534)))) -- Kaunas
               and not ((st_within(way, (select way from planet_osm_polygon where osm_id = -1014347))) or (st_crosses(way, (select way from planet_osm_polygon where osm_id = -1014347)))) -- Klaipeda
               and not ((st_within(way, (select way from planet_osm_polygon where osm_id = -968826))) or (st_crosses(way, (select way from planet_osm_polygon where osm_id = -968826)))) -- Siauliai
               and not ((st_within(way, (select way from planet_osm_polygon where osm_id = -1567531))) or (st_crosses(way, (select way from planet_osm_polygon where osm_id = -1567531)))) -- Panevezys
               and ref is not null
               and exception is null
               and osm_id not in (5170056)) loop
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
      1020, -- error_type
          ''incorrect classification'', -- error_name
      ''way'', -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now()  --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
    );
  end loop;
end' language plpgsql;
