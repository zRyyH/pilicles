const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false
});

module.exports = {
    sequelize
};