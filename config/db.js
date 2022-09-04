import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ paht: '.env' })

const db = new Sequelize(process.env.BD, process.env.BD_USER, process.env.PASSWORD ?? '', {
    host: process.env.HOST,
    port: 3306,
    dialect: 'mysql',
    define: {
        timestamps: true
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorAliases: false
});

export default db;