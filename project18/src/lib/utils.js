export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

export const generateFilename = () => {
  return `screenshot-${Date.now()}.png`;
};
