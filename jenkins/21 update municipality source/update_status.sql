truncate table address.status;
insert into address.status values (:sav_kodas);

drop view if exists address.address_source;
create view address.address_source as
  select objectid AS id
        ,gy.vardas AS city
        ,ga.vardas_k || ' ' || ga.tipo_santrumpa AS street
        ,f.nr AS housenumber
        ,f.korpuso_nr AS unit
        ,geom
    from address.addresses a
        ,address.addresses_full f
        ,address.gyvenvietes gy
        ,address.gatves ga
   where a.aob_kodas = f.aob_kodas
     and gy.gyv_kodas = a.gyv_kodas
     and ga.gyv_kodas = a.gyv_kodas
     and ga.gat_kodas = a.gat_kodas
;

--create index addresses_full_idx on address.addresses_full (aob_kodas);
--create index addresses_gyvenvietes_idx on address.gyvenvietes (gyv_kodas);
--create index addresses_gatves_idx on address.gatves(gyv_kodas, gat_kodas);
