drop table errors;
create table errors (
  source text
 ,schema text
 ,error_id integer
 ,error_type integer
 ,error_name text
 ,object_type text
 ,object_id bigint
 ,state text
 ,description text
 ,first_occurrence date
 ,last_checked date
 ,object_timestamp timestamp
 ,lat integer
 ,lon integer
 ,comment text
 ,comment_timestamp timestamp
 ,msgid text
 ,txt1 text
 ,txt2 text
 ,txt3 text
 ,txt4 text
 ,txt5 text
 ,user_name text
 ,fixed integer
);
grant all on errors to tomas;