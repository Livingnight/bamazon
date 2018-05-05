// const mysql = require("mysql");
const inquirer = require("inquirer");
const Database = require("./Database");

const connection = new Database();

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
        if (answer.returnToStart === 'Yes') {
            afterConnection();
        } else {
            connection.end();
        }
    })
};
const afterConnection = () => {
    connection.selectAll(results => {
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
                    viewProducts(results);
                    break;
                case 'View Low Inventory':
                    viewLowInventory(results);
                    break;
                case 'Add To Inventory':
                    addInventory(results);
                    break;
                case 'Add New Product':
                    addProduct();
                    break;
            }
        })
    });

};
const viewProducts = (results) => {

    // if (err) throw err;
    results.forEach(value => {
        console.log(`Item ID: ${value.item_id}
            Product: ${value.product_name}
            Price: ${value.price}
            --------------------`)
    });
    start();
};
const viewLowInventory = results => {
    // if (err) throw err;
    results.forEach(value => {
        if (value.stock_quantity < 5) {
            console.log(`Item ID: ${value.item_id}
              Product: ${value.product_name}
              Price: ${value.price}
              Quantity: ${value.stock_quantity}`);
        }
    });
    start();
};
const addInventory = results => {
    inquirer
        .prompt([
            {
                name: 'product',
                type: 'list',
                message: 'Which product would like to to add inventory to?',
                choices: () => {
                    let choiceArray = [];
                    results.forEach(value => {
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
                    if (isNaN(value) === false) {
                        return true;
                    } else {
                        console.log(` Numbers Only Please!`);
                        return false;
                    }
                }
            }
        ]).then(answer => {
        let userChoice;
        results.forEach(value => {
            if (value.product_name === answer.product) {
                userChoice = value;
                return userChoice;
            }
        });
        const newQuanitity = parseInt(answer.amountToAdd) + userChoice.stock_quantity;

        const post = [
            {
                stock_quantity: newQuanitity
            },
            {
                product_name: answer.product
            }
        ];
        connection.update(post, (error, result) => {
            if (error) throw error;
            callback(result);
            console.log(result);
            console.log(`${answer.product} has an updated quantity of ${newQuanitity}!`);
            start();
        });

    })

};
const addProduct = () => {
    inquirer
        .prompt([
            {
                name: 'product_name',
                type: 'input',
                message: 'What product would you like to add to the site?',
            },
            {
                name: 'department_name',
                type: 'input',
                message: 'What department does this product belong in?'
            },
            {
                name: 'price',
                type: 'input',
                message: "What is the price of the item?",
                validate: value => {
                    if (isNaN(value) === false) {
                        return true;
                    } else {
                        console.log(' Numbers only please!');
                        return false
                    }
                }
            },
            {
                name: 'stock_quantity',
                type: 'input',
                message: 'How much inventory would you like to add?',
                validate: value => {
                    if (isNaN(value) === false) {
                        return true;
                    } else {
                        console.log(' Numbers only please!');
                        return false
                    }
                }
            }

        ]).then(answer => {
        connection.post([answer], results => {
            console.log('Your Item has been logged to our database.');
            start();
        })
    })
};
afterConnection();