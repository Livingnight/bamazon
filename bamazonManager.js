const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});

connection.connect(err => {
    if(err) throw err;
    console.log(`Connected as ${connection.threadId}`);
    afterConnection();
});
const start = () => {
    inquirer
        .prompt([
            {
                name: 'returnToStart',
                type: 'list',
                message: 'Would you like to choose another action?',
                choices: ['Yes', 'No']
            }
        ]).then(answer => {
            if(answer.returnToStart === 'Yes'){
                afterConnection();
            }else{
                connection.end();
            }
    })
};
const afterConnection = () => {
    const query = `SELECT * FROM products`;
    connection.query(query, (err,res,fields) => {
        inquirer
            .prompt([
                {
                    name: 'userChoice',
                    type: 'rawlist',
                    message: 'Please choose what you would like to do.',
                    choices: ['View Products For Sale', 'View Low Inventory', 'Add To Inventory', 'Add New Product']
                }

            ]).then(answer => {
            switch (answer.userChoice) {
                case 'View Products For Sale':
                    viewProducts(err,res,fields);
                    break;
                case 'View Low Inventory':
                    viewLowInventory(err,res,fields);
                    break;
                case 'Add To Inventory':
                    addInventory(err,res,fields);
                    break;
                case 'Add New Product':
                    addProduct();
                    break;
            }
        })
    });
};
const viewProducts = (err,res,fields) => {

        if(err) throw err;
        res.forEach(value => {
            console.log(`Item ID: ${value.item_id}
            Product: ${value.product_name}
            Price: ${value.price}
            --------------------`)
        });
        start();
};
const viewLowInventory = (err,res,fields) => {
      if(err) throw err;
      res.forEach(value => {
          if(value.stock_quantity < 5){
              console.log(`Item ID: ${value.item_id}
              Product: ${value.product_name}
              Price: ${value.price}
              Quantity: ${value.stock_quantity}`);
          }
      });
      start();
};
const addInventory = (err,res,fields) => {
    inquirer
        .prompt([
            {
                name: 'product',
                type: 'list',
                message: 'Which product would like to to add inventory to?',
                choices: () => {
                    let choiceArray = [];
                    res.forEach(value => {
                        choiceArray.push(value.product_name);
                    });
                    return choiceArray;
                }
            },
            {
              name: 'amountToAdd',
              type: 'input',
              message: 'How much inventory would you like to add?',
              validate: value => {
                  if(isNaN(value) === false){
                      return true;
                  }else{
                      console.log(` Numbers Only Please!`);
                      return false;
                  }
              }
            }
        ]).then(answer => {
            let userChoice;
            res.forEach(value => {
                if(value.product_name === answer.product){
                    userChoice = value;
                    return userChoice;
                }
            });
        console.log(JSON.stringify(userChoice, null,2));
        console.log(userChoice.stock_quantity + parseInt(answer.amountToAdd));
        console.log(answer.product);
        const query = 'UPDATE products SET ? = ?';
        const newQuanitity = parseInt(answer.amountToAdd) + userChoice.stock_quantity;
        const post = [
            {
                stock_quantity: newQuanitity
            },
            {
                product_name: answer.product
            }
        ];
        connection.query(query, post, (error, result, fields) => {
            if(error) throw error;
            console.log(`You have added ${result.newQuanitity} to ${result.answer.product}!`);
            start();
        })
    })
};

