/** Line icons drawn on a 24x24 grid. Add a new one by adding its paths here. */
const PATHS = {
  location:
    'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.800 12 21 12 21Z M12 12a2.5 2.5 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z',
  calendar: 'M4 6.500h16V20H4Z M4 10.500h16 M8 3.500v5 M16 3.500v5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7.500V12l3.500 2',
  tag: 'M3.500 12.500V4h8.500l8.500 8.500-8.500 8.500Z M8 8.500h.01',
  bids: 'M4 5h16v11H11l-5 4v-4H4Z M8 9h8 M8 12.500h5',
  check: 'M4.500 12.500 9.500 17.500 19.500 6.500',
  shield:
    'M12 3 4.500 6v6c0 4.500 3.200 7.700 7.500 9 4.300-1.300 7.500-4.500 7.500-9V6Z M8.500 12l2.500 2.500 4.500-5',
  search: 'M10.500 17a6.500 6.500 0 1 0 0-13 6.500 6.500 0 0 0 0 13Z M15.500 15.500 20.500 20.500',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  close: 'M6 6l12 12 M18 6 6 18',
  phone:
    'M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z',
  mail: 'M3.500 5.500h17v13h-17Z M4 6.500l8 6.500 8-6.500',
  plus: 'M12 5v14 M5 12h14',
  star: 'M12 3.500l2.600 5.400 5.900.800-4.300 4.100 1.100 5.900L12 16.900l-5.300 2.800 1.100-5.900-4.300-4.100 5.900-.800Z',
};

export default function Icon({ name, size = 18, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
