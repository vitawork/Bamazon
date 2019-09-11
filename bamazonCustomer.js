require("dotenv").config();
var keys = require("./keys.js");
var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection(keys.database_confi);

connection.connect(function(err) {
  if (err) throw err;
  ShowProducts();
});

function ShowProducts() {
  connection.query(
    "SELECT item_id, product_name, price FROM `bamazon`.`products`",
    function(err, res) {
      if (err) throw err;

      const transformed = res.reduce((acc, { item_id, ...x }) => {
        acc[item_id] = x;
        return acc;
      }, {});
      console.table(transformed);

      AskingProductToUser(res);
    }
  );
}

function AskingProductToUser(res) {
  inquirer
    .prompt({
      name: "product_id",
      type: "input",
      message: "Please enter the index of the product you would like to buy."
    })
    .then(function(answer) {
      let found = false;
      let id;
      for (let a in res) {
        if (res[a].item_id == answer.product_id) {
          found = true;
          id = res[a].item_id;
        }
      }

      if (!found) {
        console.log("---The Id was not found.---");
        ComandOrExit();
      } else {
        inquirer
          .prompt({
            name: "units",
            type: "input",
            message: "How many units you would like to buy."
          })
          .then(function(answer) {
            connection.query(
              "SELECT product_name, stock_quantity, price FROM `bamazon`.`products` WHERE ?",
              { item_id: id },
              function(err, res2) {
                if (err) throw err;

                if (answer.units > res2[0].stock_quantity) {
                  console.log(
                    `---Insufficient quantity! ${res2[0].stock_quantity} in stock---`
                  );
                  ComandOrExit();
                } else {
                  Purchase(id, res2, answer.units);
                }
              }
            );
          });
      }
    });
}

function Purchase(id, res, units) {
  if (res[0].stock_quantity - units === 0) {
    connection.query(
      "DELETE FROM `bamazon`.`products` WHERE ?",
      [
        {
          item_id: id
        }
      ],
      function(err, res3) {
        if (err) throw err;
        Receipt(res, units);
      }
    );
  } else {
    connection.query(
      "UPDATE `bamazon`.`products` SET ? WHERE ?",
      [
        {
          stock_quantity: res[0].stock_quantity - units
        },
        {
          item_id: id
        }
      ],
      function(err, res3) {
        if (err) throw err;
        Receipt(res, units);
      }
    );
  }
}

function Receipt(res, units) {
  console.log(
    `---------------------------------------\nReceipt:\n   ${units} X ${
      res[0].product_name
    }  $${
      res[0].price
    }\n---------------------------------------\n   Total: $${res[0].price *
      units}\n---------------------------------------`
  );
  ComandOrExit();
}

function ComandOrExit() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: ["Buy a product.", "Exit"]
    })
    .then(function(answer) {
      switch (answer.action) {
        case "Buy a product.":
          ShowProducts();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}
