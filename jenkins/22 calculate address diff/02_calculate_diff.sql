create or replace procedure address.calculate_addr_diff() language plpgsql as $$
declare
c record;
cc record;
l_sav_kod text;
l_found boolean;
l_too_far boolean;
l_atstumas float;
l_osm_geom geometry;
l_osm_id bigint;
l_osm_type text;
l_object_type text;
l_x float;
l_y float;
l_t float;
l_b float;
l_l float;
l_r float;
l_add_tags text;
begin
  select sav_kod into l_sav_kod from address.status;
  raise notice 'Skaičiuojama savivaldybė %', l_sav_kod;
  delete from address.address_diff where sav_kod = l_sav_kod;
  update address.address_osm set addr_found = null;
  raise notice 'Pasiruošta skaičiavimui';
  for c in (select city
                  ,street
                  ,housenumber
                  ,unit
                  ,geom
              from address.address_source
           ) loop
    --raise notice '% % %', c.city, c.street, c.housenumber;
    l_found = false;
    l_too_far = false;
    for cc in (select osm_id
                     ,case when geom_type = 'N' then 'node'
                           when geom_type = 'P' then 'way'
                           else ''
                      end AS type
                     ,geom_type
                     ,st_distance(st_transform(geom, 3346), st_transform(c.geom, 3346)) distance
                     ,geom
                 from address.address_osm
                where c.city = city
                  and coalesce(c.street, '') = street
                  and c.housenumber = housenumber
                  and coalesce(c.unit::text, '!@#') = coalesce(unit,'!@#')
                  and addr_found is null
               order by geom <-> c.geom
               limit 1
              ) loop
      l_found = true;
      l_osm_id = cc.osm_id;
      l_osm_type = cc.geom_type;
      l_object_type = cc.type;
      if cc.distance > 50 then
        l_too_far = true;
        l_atstumas = cc.distance;
        l_osm_geom = cc.geom;
      end if;
      update address.address_osm set addr_found = 'Y' where osm_id = cc.osm_id;
    end loop;
    l_x = round(st_x(st_transform(c.geom, 4326))::numeric,6);
    l_y = round(st_y(st_transform(c.geom, 4326))::numeric,6);
    l_t = l_y * 1.00002;
    l_b = l_y * 0.99998;
    l_l = l_x * 0.9999;
    l_r = l_x * 1.0001;
    if not l_found then
      raise notice 'Trūksta adreso: % % %', c.city, c.street, c.housenumber;
      if c.street is not null then
        l_add_tags = 'addr%3Acity=' || replace(c.city, ' ', '%20') || '%7C' ||
                     'addr%3Astreet=' || replace(c.street, ' ', '%20') || '%7C' ||
                     'addr%3Ahousenumber=' || c.housenumber;
      else
        l_add_tags = 'addr%3Acity=' || replace(c.city, ' ', '%20') || '%7C' ||
                     'addr%3Aplace=' || replace(c.city, ' ', '%20') || '%7C' ||
                     'addr%3Anostreet=yes%7C' ||
                     'addr%3Ahousenumber=' || c.housenumber;
      end if;
      if c.unit is not null then
        l_add_tags = l_add_tags || '%7C' || 'addr%3Aunit=' || c.unit;
      end if;
      insert into address.address_diff(
        sav_kod
       ,type
       ,city
       ,street
       ,housenumber
       ,unit
       ,x
       ,y
       ,action_open
       ,action
       ,geom)
      values (
        l_sav_kod
       ,'N'
       ,c.city
       ,c.street
       ,c.housenumber
       ,c.unit
       ,l_x
       ,l_y
       ,'http://localhost:8111/load_and_zoom?top=' || l_t || '&bottom=' || l_b || '&left=' || l_l || '&right=' || l_r
       ,'http://localhost:8111/add_node?lon=' || l_x || '&lat=' || l_y || '&addtags=' || l_add_tags
       ,c.geom
      );
    elseif l_too_far then
      raise notice 'Per toli adresas: % % % (%m.)', c.city, c.street, c.housenumber, l_atstumas;
      insert into address.address_diff(
        sav_kod
       ,type
       ,city
       ,street
       ,housenumber
       ,unit
       ,x
       ,y
       ,action_open
       ,note
       ,geom
       ,osm_geom
       ,osm_id
       ,osm_type)
      values (
        l_sav_kod
       ,'M'
       ,c.city
       ,c.street
       ,c.housenumber
       ,c.unit
       ,round(st_x(st_transform(c.geom, 4326))::numeric,6)
       ,round(st_y(st_transform(c.geom, 4326))::numeric,6)
       ,'http://localhost:8111/load_and_zoom?top=' || l_t || '&bottom=' || l_b || '&left=' || l_l || '&right=' || l_r || '&select=' || l_object_type || l_osm_id
       ,'Per toli: ' || l_atstumas || 'm.'
       ,c.geom
       ,l_osm_geom
       ,l_osm_id
       ,l_osm_type
      );
    end if;
  end loop;

  for c in (select city
                  ,street
                  ,housenumber
                  ,unit
                  ,case when geom_type = 'N' then 'node'
                        when geom_type = 'P' then 'way'
                        else ''
                   end AS type
                  ,osm_id
                  ,geom
              from address.address_osm o
             where addr_found is null
           ) loop
    raise notice 'Nebėra % % %', c.city, c.street, c.housenumber;
    l_x = round(st_x(st_transform(st_centroid(c.geom), 4326))::numeric,6);
    l_y = round(st_y(st_transform(st_centroid(c.geom), 4326))::numeric,6);
    l_t = l_y * 1.00002;
    l_b = l_y * 0.99998;
    l_l = l_x * 0.9999;
    l_r = l_x * 1.0001;
    insert into address.address_diff(
      sav_kod
     ,type
     ,city
     ,street
     ,housenumber
     ,unit
     ,action
     ,action_open
     ,geom
     ,osm_geom)
    values (
      l_sav_kod
     ,'D'
     ,c.city
     ,c.street
     ,c.housenumber
     ,null -- unit
     ,'http://localhost:8111/load_and_zoom?top=' || l_t || '&bottom=' || l_b || '&left=' || l_l || '&right=' || l_r || '&select=' || c.type || c.osm_id
     ,'http://localhost:8111/load_and_zoom?top=' || l_t || '&bottom=' || l_b || '&left=' || l_l || '&right=' || l_r
     ,c.geom
     ,l_osm_geom
    );
  end loop;
end$$;

call address.calculate_addr_diff();
