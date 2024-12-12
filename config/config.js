require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "savethedata2024!",
    database: process.env.DB_NAME || "puff_palace",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "postgres",
  },
  test: {
    username: process.env.TEST_DB_USERNAME || "root",
    password: process.env.TEST_DB_PASSWORD || null,
    database: process.env.TEST_DB_NAME || "database_test",
    host: process.env.TEST_DB_HOST || "127.0.0.1",
    dialect: process.env.TEST_DB_DIALECT || "mysql",
  },
  production: {
    username: process.env.PROD_DB_USERNAME || "root",
    password: process.env.PROD_DB_PASSWORD || null,
    database: process.env.PROD_DB_NAME || "database_production",
    host: process.env.PROD_DB_HOST || "127.0.0.1",
    dialect: process.env.PROD_DB_DIALECT || "mysql",
  },
};
