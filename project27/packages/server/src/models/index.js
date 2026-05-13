const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const Document = require('./Document')(sequelize);
const Category = require('./Category')(sequelize);
const Admin = require('./Admin')(sequelize);

Category.hasMany(Document, {
  foreignKey: 'categoryId',
  as: 'documents',
  onDelete: 'SET NULL'
});
Document.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Admin.hasMany(Document, {
  foreignKey: 'uploaderId',
  as: 'uploadedDocuments',
  onDelete: 'SET NULL'
});
Document.belongsTo(Admin, {
  foreignKey: 'uploaderId',
  as: 'uploader'
});

const db = {
  sequelize,
  Document,
  Category,
  Admin
};

module.exports = db;
