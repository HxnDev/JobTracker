import { Badge } from '@/components/ui/badge';
import { STATUS_STYLES } from '@/constants/options';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }) {
  const key = STATUS_STYLES[status] ? status : 'Unknown';
  return (
    <Badge className={cn(STATUS_STYLES[key])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status || '—'}
    </Badge>
  );
}
