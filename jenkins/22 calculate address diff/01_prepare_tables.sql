drop table if exists address.address_osm;
create table address.address_osm as
  select osm_id
        ,'N' geom_type
        ,"addr:city" city
        ,coalesce("addr:street", '') street
        ,"addr:housenumber" housenumber
        ,"addr:unit" unit
        ,null::char addr_found
        ,st_transform(way, 4326) geom
    from planet_osm_point
   where st_contains((select way from planet_osm_polygon where admin_level = '5' and ref = (select sav_kod from address.status)), way)
     and "addr:city" is not null
     and "addr:housenumber" is not null
     and "addr:contact" is null
  union
  select osm_id
        ,'P' geom_type
        ,"addr:city" city
        ,coalesce("addr:street", '') street
        ,"addr:housenumber" housenumber
        ,"addr:unit" unit
        ,null::char addr_found
        ,st_transform(way, 4326) geom
    from planet_osm_polygon
   where st_contains((select way from planet_osm_polygon where admin_level = '5' and ref = (select sav_kod from address.status)), way)
     and "addr:city" is not null
     and "addr:housenumber" is not null
     and "addr:contact" is null
  ;
create index address_osm_gix on address.address_osm using gist(geom);
create index address_osm_csh_idx on address.address_osm (city,street,housenumber);
create index address_osm_id_idx on address.address_osm (osm_id);
