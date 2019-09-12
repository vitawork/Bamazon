require("dotenv").config();
var keys = require("./keys.js");
var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection(keys.database_confi);

connection.connect(function(err) {
  if (err) throw err;
  runSearch();
});

function runSearch() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View Product Sales by Department",
        "Create New Department",
        "Exit"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
        case "View Product Sales by Department":
          ViewProductsSalesByDepartment();
          break;

        case "Create New Department":
          AddDepartment();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

function ViewProductsSalesByDepartment() {
  var query =
    "SELECT d.department_id, d.department_name AS Department, d.over_head_costs AS Costs, SUM(p.product_sales) AS Sales, SUM(p.product_sales) - d.over_head_costs As Profit FROM bamazon.departments  d LEFT JOIN bamazon.products p  ON  d.department_name= p.department_name GROUP BY d.department_name ORDER BY d.department_name";

  connection.query(query, function(err, res) {
    if (err) throw err;

    const transformed = res.reduce((acc, { department_id, ...x }) => {
      acc[department_id] = x;
      return acc;
    }, {});
    console.table(transformed);

    runSearch();
  });
}

function AddDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "Enter the department name."
      },
      {
        name: "costs",
        type: "input",
        message: "Enter the department over head costs."
      }
    ])
    .then(function(answer) {
      if (isNaN(answer.costs)) {
        console.log("-----------------------------");
        console.log("---You enter a wrong value---");
        console.log("-----------------------------");
        runSearch();
      } else {
        connection.query(
          "INSERT INTO departments SET ?",
          {
            department_name: answer.name,
            over_head_costs: answer.costs
          },
          function(err, res2) {
            if (err) throw err;
            console.log("-----------------------------------");
            console.log("---The new department was added.---");
            console.log("-----------------------------------");
            runSearch();
          }
        );
      }
    });
}
