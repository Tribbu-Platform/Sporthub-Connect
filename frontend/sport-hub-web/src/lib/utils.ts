export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'ahora';
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays < 7) return `hace ${diffDays} d`;
  return formatDate(date, { dateStyle: 'medium' });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
