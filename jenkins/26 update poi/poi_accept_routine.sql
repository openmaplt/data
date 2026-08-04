create or replace function places.accept_change(p_osm_id bigint, p_obj_type text, p_change text) returns void as $$
declare
l_poi places.poi_change%rowtype;
begin
  raise notice 'accepting change % % %', p_osm_id, p_obj_type, p_change;
  if (p_change = 'D') then
    raise notice 'deleting poi';
    delete from places.poi where osm_id = p_osm_id and obj_type = p_obj_type;
  elsif (p_change = 'N') then
    raise notice 'inserting new poi';
    select * into l_poi from places.poi_change where obj_type = p_obj_type and osm_id = p_osm_id;
    insert into places.poi (
      osm_id
     ,obj_type
     ,uid
     ,attr
     ,type
     ,geom
    ) values (
      l_poi.osm_id
     ,l_poi.obj_type
     ,nextval('poi_uid')
     ,l_poi.attr
     ,places.get_type(l_poi)
     ,l_poi.geom
    );
  elsif (p_change = 'C') then
    raise notice 'updating poi';
    select * into l_poi from places.poi_change where obj_type = p_obj_type and osm_id = p_osm_id;
    update places.poi
       set attr = l_poi.attr
          ,type = places.get_type(l_poi)
          ,geom = l_poi.geom
     where obj_type = p_obj_type
       and osm_id = p_osm_id;
raise notice 'Changing % % -> %', p_obj_type, p_osm_id, l_poi.attr;
  end if;
  raise notice ' Deleting processed poi_change';
  delete from places.poi_change where osm_id = p_osm_id and obj_type = p_obj_type;
end
$$ language plpgsql;
