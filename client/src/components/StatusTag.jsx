import { TASK_STATUS } from '../lib/constants.js';

/** A coloured label for a task or bid status. */
export default function StatusTag({ status, map = TASK_STATUS }) {
  const { label, tone } = map[status];
  return <span className={`tag tag--${tone}`}>{label}</span>;
}
