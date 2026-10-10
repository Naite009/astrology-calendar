import type { TakeawayAction } from '@/lib/interpretation/takeawayActions';
import { actionText } from '@/lib/interpretation/takeawayActions';

export function TryThisAction({ action }: { action?: TakeawayAction }) {
  if (!action) return null;
  return <p className="mt-2 text-xs leading-relaxed text-foreground"><span className="font-medium text-primary">Try this:</span> {actionText(action)}</p>;
}