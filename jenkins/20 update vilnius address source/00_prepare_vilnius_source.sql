drop view if exists address.address_source;
create view address.address_source as
  select objectid AS id
        ,gyv_pav AS city
        ,pav AS street
        ,namo_nr || coalesce(namo_r, '') AS housenumber
        ,korpuso_nr AS unit
        ,geom
    from address.vilnius_addresses;

create index vilnius_addresses_idx on address.vilnius_addresses (gyv_pav,pav);

truncate table address.status;
insert into address.status values ('13');
