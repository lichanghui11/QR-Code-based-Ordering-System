-- 1. 用户表
CREATE TABLE
  IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    title TEXT
  );

-- 2. 菜品表
CREATE TABLE
  IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rid INTEGER NOT NULL, -- 关联的商家/餐馆 ID 等
    name TEXT NOT NULL,
    "desc" TEXT, -- "desc" 是 SQL 里的关键字，最好用引号或改成 description
    price REAL,
    img TEXT,
    category TEXT,
    status TEXT -- 比如 "on" / "off" 表示是否上架
  );

-- 3. 桌位表
CREATE TABLE
  IF NOT EXISTS desks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rid INTEGER, -- 关联的商家/餐馆 ID
    name TEXT NOT NULL, -- 桌名
    capacity INTEGER -- 座位数
  );

-- 4. 订单表
CREATE TABLE
  IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rid INTEGER, -- 商家/餐馆 ID
    did INTEGER, -- 对应的桌子 ID (外键)
    deskName TEXT, -- 方便查询时直接携带桌子名称
    customCoun INTEGER, -- 客人人数
    details TEXT, -- 例如存储 JSON：[{id, count, ...}]
    status TEXT, -- active / completed / canceled
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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