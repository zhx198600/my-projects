const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '文件标题/名称'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '文件描述'
    },
    content: {
      type: DataTypes.TEXT,
      comment: '文件内容或提取的文本内容'
    },
    fileName: {
      type: DataTypes.STRING,
      comment: '原始文件名'
    },
    filePath: {
      type: DataTypes.STRING,
      comment: '文件存储路径'
    },
    fileSize: {
      type: DataTypes.BIGINT,
      comment: '文件大小(字节)'
    },
    fileType: {
      type: DataTypes.STRING,
      comment: 'MIME类型'
    },
    fileExt: {
      type: DataTypes.STRING,
      comment: '文件扩展名'
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '下载次数'
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '状态：true发布，false草稿'
    },
    tags: {
      type: DataTypes.STRING,
      comment: '标签，逗号分隔'
    },
    author: {
      type: DataTypes.STRING,
      comment: '作者名称'
    }
  }, {
    timestamps: true,
    tableName: 'documents',
    comment: '文件表',
    indexes: [
      {
        name: 'idx_documents_content',
        fields: ['content'],
        type: 'FULLTEXT'
      },
      {
        name: 'idx_documents_createdAt',
        fields: ['createdAt']
      }
    ]
  });

  return Document;
};
