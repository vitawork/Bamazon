require('dotenv').config();
var keys = require("./keys.js")
var mysql = require("mysql");
var inquirer = require("inquirer");
const link = mysql.createConnection(keys.database_confi);
