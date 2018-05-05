require("dotenv").load();
const mysql = require("mysql");

class Database {
    constructor() {
        this.host = process.env.DB_HOST;
        this.port = 3306;
        this.user = process.env.DB_USER;
        this.password = process.env.DB_PASSWORD;
        this.database = process.env.DB_DATABASE;

        this._connect = mysql.createConnection({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database
        });

        this._selectQuery = "SELECT * FROM products";
        this._selectOneQuery = "SELECT * FROM products WHERE ?";
        this._insertQuery = "INSERT INTO products SET ?";
        this._updateQuery = "UPDATE products SET ? WHERE ?";
    }

    post(item, callback) {
        this._connect.query(
            this._insertQuery,
            item,
            (error, result) => {
                if (error) throw error;
                callback(result);
            });
    }

    selectAll(callback) {
        this._connect.query(
            this._selectQuery,
            (error, result) => {
                if (error) throw error;
                callback(result);
            });
    }

    selectOne(value, callback) {
        this._connect.query(
            this._selectOneQuery,
            value,
            (error, result) => {
                if (error) throw error;
                callback(result);
            }
        );
    }

    update(postObject, callback) {
        this._connect.query(this._updateQuery, postObject, (error, result) => {
            if (error) throw error;
            callback(result);
        });
    }

    end() {
        this._connect.end(error => {
            if (error) throw error;
            console.log("Connection closed");
        });
    }
}

module.exports = Database;