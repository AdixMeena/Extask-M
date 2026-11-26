/** Suggestions only: the category field accepts any text. */
export const CATEGORY_SUGGESTIONS = [
  'Plumbing',
  'Electrical',
  'Tutoring',
  'Moving',
  'Errands',
  'Setup',
  'Assembly',
  'Painting',
  'Design',
  'Typing',
  'Cleaning',
  'Tailoring',
];

export const TASK_STATUS = {
  open: { label: 'Open for bids', tone: 'orange' },
  assigned: { label: 'Someone hired', tone: 'ink' },
  completed: { label: 'Completed', tone: 'teal' },
  cancelled: { label: 'Cancelled', tone: 'grey' },
};

export const BID_STATUS = {
  pending: { label: 'Waiting for reply', tone: 'orange' },
  accepted: { label: 'You are hired', tone: 'teal' },
  rejected: { label: 'Not selected', tone: 'grey' },
};
