

--大喵建的表： 
CREATE TABLE
  users (
    id integer primary key,
    name string not null,
    password string not null,
    email string,
    title string not null
  );

CREATE TABLE
  foods (
    id integer primary key,
    rid integer not null,
    name string not null,
    desc string,
    price integer not null,
    img string,
    category string,
    status string not null
  );

CREATE TABLE
  orders (
    id integer primary key,
    rid integer not null,
    did integer not null,
    deskName string not null,
    customCount integer not null,
    details string not null,
    status string,
    timestamp string not null,
    totalPrice integer
  );

CREATE TABLE
  desks (
    id integer primary key,
    rid integer not null,
    name string not null,
    capacity integer
  );