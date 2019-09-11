DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products (
 item_id INT NOT NULL AUTO_INCREMENT,
 product_name VARCHAR(200),
 department_name VARCHAR(200),
 price DECIMAL(10, 2),
 stock_quantity INT,
 product_sales DECIMAL(10, 2),
 PRIMARY KEY (item_id)
);

CREATE TABLE departments (
 department_id INT NOT NULL AUTO_INCREMENT,
 department_name VARCHAR(200),
 over_head_costs DECIMAL(10, 2),
 PRIMARY KEY (department_id) 
);