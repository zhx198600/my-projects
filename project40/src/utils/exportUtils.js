import { formatDate } from './dateUtils.js';

export function exportToJSON(tasks, categories, filename) {
  const data = {
    tasks,
    categories
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, filename);
}

export function exportToCSV(tasks, categories, filename) {
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.id] = cat.name;
  });

  const headers = ['ID', '标题', '描述', '分类', '截止日期', '优先级', '状态', '创建时间', '更新时间'];
  const rows = tasks.map(task => {
    return [
      task.id,
      task.title,
      task.description || '',
      categoryMap[task.categoryId] || '',
      formatDate(task.dueDate),
      task.priority,
      task.status,
      formatDate(task.createdAt),
      formatDate(task.updatedAt)
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => escapeCSVField(field)).join(','))
    .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
}

function escapeCSVField(field) {
  if (field == null) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getExportFilename(extension) {
  return `tasks_${formatDate(new Date())}.${extension}`;
}
