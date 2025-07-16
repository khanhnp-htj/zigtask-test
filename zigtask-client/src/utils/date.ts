export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isOverdue = (dueDateString?: string): boolean => {
  if (!dueDateString) return false;
  const dueDate = new Date(dueDateString);
  const now = new Date();
  return dueDate < now;
};

export const getDaysUntilDue = (dueDateString?: string): number | null => {
  if (!dueDateString) return null;
  const dueDate = new Date(dueDateString);
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}; 