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
        "View Products for Sale",
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product",
        "Exit"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
        case "View Products for Sale":
          ViewProducts();
          break;

        case "View Low Inventory":
          LowInventory();
          break;

        case "Add to Inventory":
          AddInventory();
          break;

        case "Search for a specific song":
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

function ViewProducts() {
  connection.query(
    "SELECT item_id, product_name, price, stock_quantity FROM `bamazon`.`products`",
    function(err, res) {
      if (err) throw err;

      const transformed = res.reduce((acc, { item_id, ...x }) => {
        acc[item_id] = x;
        return acc;
      }, {});
      console.table(transformed);

      runSearch();
    }
  );
}

function LowInventory() {
  connection.query(
    "SELECT * FROM bamazon.products  HAVING stock_quantity < 5",
    function(err, res) {
      if (err) throw err;

      const transformed = res.reduce((acc, { item_id, ...x }) => {
        acc[item_id] = x;
        return acc;
      }, {});
      console.table(transformed);

      runSearch();
    }
  );
}

function AddInventory() {
  connection.query("SELECT * FROM `bamazon`.`products`", function(err, res) {
    if (err) throw err;

    const transformed = res.reduce((acc, { item_id, ...x }) => {
      acc[item_id] = x;
      return acc;
    }, {});
    console.table(transformed);

    inquirer
      .prompt({
        name: "product_id",
        type: "input",
        message: "Please enter the index of the product."
      })
      .then(function(answer) {
        let found = false;
        let prod;
        for (let a in res) {
          if (res[a].item_id == answer.product_id) {
            found = true;
            prod = res[a];
          }
        }

        if (!found) {
          console.log("---The Id was not found.---");
          runSearch();
        } else {
          inquirer
            .prompt({
              name: "units",
              type: "input",
              message: "How many units you going to add."
            })
            .then(function(answer) {
              connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: prod.stock_quantity + parseInt(answer.units)
                  },
                  { item_id: prod.item_id }
                ],
                function(err, res2) {
                  if (err) throw err;
                  runSearch();
                }
              );
            });
        }
      });
  });
}
