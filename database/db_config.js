require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool();

module.exports = { pool };

const pgp = require('pg-promise')();

const cn = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD
};

const db = pgp(cn); // database instance;

module.exports = { db };