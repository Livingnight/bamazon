DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products(
    item_id INT NOT NULL AUTO_INCREMENT UNIQUE,
    product_name VARCHAR(50),
    department_name VARCHAR(50),
    price DECIMAL(10,3),
    stock_quantity INTEGER(10),
    PRIMARY KEY (item_id)
);

INSERT INTO bamazon_DB(product_name,department_name,price,stock_quantity)
  VALUES
	("Dark Souls 3", "Video Games", 54.99, 4),
	("Macbook Pro 15''", "Computers", 1899.99, 3),
