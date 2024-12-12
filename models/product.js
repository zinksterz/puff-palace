'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    category: DataTypes.STRING,
    image_url: DataTypes.STRING,
    category_id: DataTypes.STRING,
    tags: DataTypes.ARRAY(DataTypes.STRING),
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    price_discounted: DataTypes.INTEGER,
    discount_percentage: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
    dimensions: DataTypes.STRING,
    rating:{
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    purchase_count:{
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    color: DataTypes.STRING,
    size: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};