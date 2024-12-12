'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'category_id',{
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "tags", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "is_featured", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn("Products", "price_discounted", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "discount_percentage", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "weight", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "dimensions", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "rating", {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    });
    await queryInterface.addColumn("Products", "views_count", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("Products", "purchase_count", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("Products", "color", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "size", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'category_id');
    await queryInterface.removeColumn("Products", "tags");
    await queryInterface.removeColumn("Products", "is_featured");
    await queryInterface.removeColumn("Products", "price_discounted");
    await queryInterface.removeColumn("Products", "discount_percentage");
    await queryInterface.removeColumn("Products", "weight");
    await queryInterface.removeColumn("Products", "dimensions");
    await queryInterface.removeColumn("Products", "rating");
    await queryInterface.removeColumn("Products", "views_count");
    await queryInterface.removeColumn("Products", "purchase_count");
    await queryInterface.removeColumn("Products", "color");
    await queryInterface.removeColumn("Products", "size");
  },
};
