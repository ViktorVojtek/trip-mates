export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const calculateMatchScore = (
  userPrefs: string | null,
  tripPrefs: string | null,
): number => {
  if (!userPrefs || !tripPrefs) return 0;
  const userSet = new Set(userPrefs.toLowerCase().split(',').map((s) => s.trim()));
  const tripSet = new Set(tripPrefs.toLowerCase().split(',').map((s) => s.trim()));
  const intersection = [...userSet].filter((x) => tripSet.has(x));
  const union = new Set([...userSet, ...tripSet]);
  return Math.round((intersection.length / union.size) * 100);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const groupTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    family: 'Families',
    couples: 'Couples',
    solo: 'Solo Travelers',
    friends: 'Friends Group',
    mixed: 'Mixed Group',
  };
  return labels[type] ?? type;
};
