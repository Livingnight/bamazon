const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});
const bamazon = () => {
    connection.connect(err => {
        if (err) throw err;
        console.log(`Connected as is ${connection.threadId}`);
        inquirer
            .prompt([
                {
                    name: 'yesOrNo',
                    type: 'list',
                    message: 'Would you like to buy something today?',
                    choices: ['Yes','No']
                }

            ]).then(answer => {
                if(answer.yesOrNo === 'Yes') {
                    afterConnection();
                }else{
                    console.log('Thanks for taking a look at our inventory! Have a great day!');
                    connection.end();
                }
        })
    });
};
bamazon();

const afterConnection = () => {
    const query = "SELECT * FROM products";
    connection.query(query, (err, res) => {
        if (err) throw err;
        res.forEach((value, index) => {
            console.log(`item_id :${value.item_id} 
            Product: ${value.product_name} 
            Price: ${value.price} dollars
            -----------------`)
        });
        inquirer
            .prompt([
                {
                    name: 'product',
                    type: 'list',
                    choices: function () {
                        let choiceArray = [];
                        res.forEach(value => {
                            choiceArray.push(value.product_name);
                        });
                        return choiceArray;
                    },
                    message: 'Which product would you like to purchase?',
                },
                {
                    name: "numItems",
                    type: 'input',
                    message: 'How many of those would you like to purchase?',
                    validate: value => {
                        if (isNaN(value) === false) {
                            return true;
                        } else {
                            console.log(' Numbers only please!');
                            return false;
                        }
                    }
                }
            ]).then(answer => {
            let userChoice;
            res.forEach(value => {
                if (value.product_name === answer.product) {
                    userChoice = value;
                    return userChoice;

                }

            });
            console.log(JSON.stringify(userChoice, null, 2));
            if (userChoice.stock_quantity > answer.numItems) {
                const newQuantity = (parseInt(userChoice.stock_quantity) - parseInt(answer.numItems));
                const post = [
                    {
                        stock_quantity: newQuantity

                    },
                    {
                        product_name: answer.product
                    }
                ];

                const thisQuery = "UPDATE products SET ? WHERE ?";
                connection.query(thisQuery,
                    post, err =>{
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    console.log(`Purchase Accepted! Your total is ${userChoice.price * parseInt(answer.numItems)}`);
                    inquirer
                        .prompt([
                            {
                                name: 'purchaseMore',
                                type: 'list',
                                message: 'Would you like to purchase anything else?',
                                choices: ['Yes', 'No']
                            }
                        ]).then(answer => {
                            if(answer.purchaseMore === 'Yes'){
                                afterConnection();
                            }else{
                                console.log(`Thank you for your patronage!`);
                                connection.end();
                            }
                    })
                });
            } else {
                console.log(`We're sorry, we don't have enough stock to place your order. Try again soon!`);
                // connection.end();

            }

        });
        // connection.end();
    });
};
