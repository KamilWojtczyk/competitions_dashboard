import { Events } from '../../features/competitions/models/events.model';

export function isProgressivePass(event: Events): boolean {
  if (!event.location || !event.pass_end_location) return false;
  const startX = event.location[0];
  const endX = event.pass_end_location[0];
  return endX >= 80 && startX < 80;
}
