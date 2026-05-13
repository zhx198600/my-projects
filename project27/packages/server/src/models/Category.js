const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '分类名称'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '分类描述'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序权重'
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '状态：true启用，false禁用'
    }
  }, {
    timestamps: true,
    tableName: 'categories',
    comment: '分类表'
  });

  return Category;
};
