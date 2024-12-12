'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Products", [
      {
        name: "Test Product 1",
        description: "This is a test product.",
        price: 1000,
        category: "Test Category",
        image_url: "http://example.com/image1.jpg",
        category_id: "test-category-id",
        tags: ["test", "sample"],
        is_featured: true,
        price_discounted: 800,
        discount_percentage: 20,
        weight: 1.5,
        dimensions: "10x10x10",
        rating: 4.5,
        views_count: 10,
        purchase_count: 2,
        color: "red",
        size: "M",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Test Product 2",
        description: "Another test product.",
        price: 2000,
        category: "Another Category",
        image_url: "http://example.com/image2.jpg",
        category_id: "another-category-id",
        tags: ["example", "test"],
        is_featured: false,
        price_discounted: null,
        discount_percentage: null,
        weight: 2.0,
        dimensions: "20x20x20",
        rating: 3.8,
        views_count: 5,
        purchase_count: 1,
        color: "blue",
        size: "L",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Products', null, {});
  },
};
