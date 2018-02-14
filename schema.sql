CREATE TABLE orders (
  id serial primary key,
  date timestamp with time zone not null default current_timestamp,
  name text,
  email text,
  amount int,
  ssn text
);