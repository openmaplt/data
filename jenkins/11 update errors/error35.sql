create or replace function error35() returns void
as '
declare
  c record;
begin
  delete from errors where source = ''lt'' and error_type = 1035;
  for c in (select osm_id
                  ,osm_timestamp
                  ,''netinkami simboliai pavadinime'' descr
                  ,''node'' typ
              from planet_osm_point
             where translate(lower(name), ''ючёъявертыуиопшщасдфгхйклзьцжбнмэ'', '''') != lower(name)
               and osm_id not in (2907629389)
            union all
            select osm_id
                  ,osm_timestamp
                  ,''netinkami simboliai pavadinime'' descr
                  ,''way'' typ
              from planet_osm_line
             where translate(lower(name), ''ючёъявертыуиопшщасдфгхйклзьцжбнмэ'', '''') != lower(name)
               and osm_id not in (-2695485
                                 ,36823080
                                 ,132328589
                                 ,143240606
                                 ,147426975
                                 ,147426973
                                 ,258506187
                                 ,273325013
                                 ,284666114
                                 )
              and admin_level != ''2''
            union all
            select osm_id
                  ,osm_timestamp
                  ,''netinkami simboliai pavadinime'' descr
                  ,''way'' typ
              from planet_osm_polygon
             where translate(lower(name), ''ючёъявертыуиопшщасдфгхйклзьцжбнмэ'', '''') != lower(name)
               and osm_id not in (-4853702
                                 ,-2783497
                                 ,-5521029
                                 ,45683158
                                 ,-6769658
                                 ,-2219214
                                 ,-5598254
                                 ,-5521028
                                 ,-7546467
                                 ,-9303671
                                 ,-6946885
                                 ,-14211161 
                                 ,28705632
                                 ,475813609
                                 ,-9632650
                                 ,119506868
                                 ,121149164)
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
      1035, -- error_type
      ''alien symbols'', -- error_name
      c.typ, -- object_type
      c.osm_id, -- object_id
      c.descr, -- description
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now(), --to_date(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
      now()  --to_timestamp(c.osm_timestamp, ''YYYY-MM-DD"T"HH24:MI:SS"Z"''),
    );
  end loop;
end' language plpgsql;
