drop table if exists address.address_diff;
create table address.address_diff (
  id serial primary key
 ,sav_kod text
 ,type char
 ,city text
 ,street text
 ,housenumber text
 ,unit text
 ,x float
 ,y float
 ,action_open text
 ,action text
 ,note text
 ,geom geometry
 ,osm_type char
 ,osm_id bigint
 ,osm_x float
 ,osm_y float
 ,osm_geom geometry
);
