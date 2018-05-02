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
    if (err) throw err;
    console.log(`Connected as is ${connection.threadId}`);
    afterConnection();
});
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
            console.log(userChoice.stock_quantity);
            if (userChoice.stock_quantity > answer.numItems) {
                const newQuantity = (parseInt(userChoice.stock_quantity) - parseInt(answer.numItems)) + '';
                console.log(`New Quantity: ${newQuantity}`);
                console.log(`product name : ${answer.product}`);
                const thisQuery = "UPDATE products SET ? WHERE ?";
                connection.query(thisQuery,
                    [
                        {
                            stock_quantity: newQuantity

                        },
                        {
                            product_name: "'" + answer.product + "'"

                        }
                        ], err =>{
                    console.log(query.sql);
                    if (err) throw err;
                    console.log(`Purchase Accepted! Your total is ${userChoice.price * parseInt(answer.numItems)}`);

                });
            } else {
                console.log(`We're sorry, we don't have enough stock to place your order. Try again soon!`);

            }
        })
        // console.log(res);
        connection.end();
    });
};
