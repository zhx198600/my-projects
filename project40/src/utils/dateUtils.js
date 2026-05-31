export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + 'T23:59:59');
}

export function isOverdue(dueDate) {
  if (!dueDate) return false;
  const now = new Date();
  const due = parseDate(dueDate);
  return due !== null && due < now;
}

export function isDueSoon(dueDate, days = 3) {
  if (!dueDate) return false;
  const now = new Date();
  const due = parseDate(dueDate);
  if (due === null) return false;
  const diff = due - now;
  const threshold = days * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= threshold;
}

export function getDaysRemaining(dueDate) {
  if (!dueDate) return null;
  const now = new Date();
  const due = parseDate(dueDate);
  if (due === null) return null;
  const diff = due - now;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export function formatDueDate(dueDate) {
  if (!dueDate) return '';
  const days = getDaysRemaining(dueDate);
  if (days === null) return formatDate(dueDate);
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  if (days === 1) return '明天到期';
  if (days <= 3) return `${days} 天后到期`;
  return formatDate(dueDate);
}
