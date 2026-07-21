create or replace function get_unaccent(p_text text) returns text
language sql immutable parallel safe strict as $$
select unaccent($1);
$$;

