create or replace function get_address(
  p_city text
 ,p_street text
 ,p_housenumber text
 ,p_unit text)
  returns text
  language plpgsql as $$
declare
l_result text = p_city || ', ';
begin
  if p_street is not null then
    l_result = l_result || p_street || ' ';
  end if;
  l_result = l_result || p_housenumber;
  if p_unit is not null then
    l_result = l_result || ' ' || p_unit;
  end if;
  return l_result;
end$$;

