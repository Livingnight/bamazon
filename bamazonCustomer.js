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
    const query = "SELECT item_id, product_name,department_name, price FROM products";
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
                    choices: function(){
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
                        if(isNaN(value) === false){
                            return true;
                        }else{
                            return false;
                        }
                    }
                }
            ]).then(answer =>{
                let userChoice;
                res.forEach(value=>{
                    if(value.product_name === answer.product) {
                        userChoice = value;
                        return userChoice
                    }
                });
                if(userChoice.stock_quantity > answer.numItems){

                }
        })
        // console.log(res);
        connection.end();
    });
};
