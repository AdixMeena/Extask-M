/**
 * The demo content, kept apart from the code that inserts it, so you can add or
 * change examples without touching any logic. People are referred to by
 * username. All names and numbers are made up.
 */

export const people = [
  {
    username: 'priya',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9000000001',
    location: 'Vijay Nagar, Indore',
    bio: 'Works in an IT office. Short on weekends, long on small repairs.',
    verified: true,
  },
  {
    username: 'ramesh',
    name: 'Ramesh Patidar',
    phone: '9000000002', // phone only account
    location: 'Khargone',
    bio: 'Electrical and plumbing work for eight years. I bring my own tools.',
    verified: true,
  },
  {
    username: 'sneha',
    name: 'Sneha Joshi',
    email: 'sneha@example.com',
    location: 'Bhawarkua, Indore',
    bio: 'Final year student. Maths tuition, posters and typing work.',
    verified: true,
  },
  {
    username: 'imran',
    name: 'Imran Khan',
    email: 'imran@example.com',
    phone: '9000000003',
    location: 'MP Nagar, Bhopal',
    bio: 'I have a loading rickshaw. Shifting, assembly and errands.',
    verified: false,
  },
  {
    username: 'kavita',
    name: 'Kavita Yadav',
    email: 'kavita@example.com',
    location: 'Borawan',
    bio: 'Home maker. I post what I need and take up stitching orders.',
    verified: false,
  },
];

/**
 * hoursAgo  - how long ago the task was posted (controls the ordering)
 * dueInDays - deadline counted from today, so it never goes stale
 * hire      - username of the bidder to select
 * complete  - mark as completed (needs hire)
 * reviews   - { poster: about the doer, doer: about the poster }
 */
export const tasks = [
  {
    poster: 'priya',
    title: 'Fix a leaking kitchen tap',
    description:
      'The kitchen tap drips all night. Probably a washer. Please bring spares, the nearest shop is closed on Sunday.',
    category: 'Plumbing',
    budget: 400,
    location: 'Vijay Nagar, Indore',
    dueInDays: 4,
    hoursAgo: 2,
    bids: [
      {
        by: 'ramesh',
        amount: 350,
        message: 'Washer change takes 20 minutes.',
        availability: 'Today after 6 pm',
      },
      {
        by: 'imran',
        amount: 400,
        message: 'I can do it on my way back from a delivery.',
        availability: 'Tomorrow morning',
      },
    ],
  },
  {
    poster: 'kavita',
    title: 'Class 9 maths tuition, three evenings a week',
    description:
      'My daughter needs help with algebra and geometry before the half-yearly exams. Home visits preferred, one month to start.',
    category: 'Tutoring',
    budget: 2500,
    location: 'Borawan',
    dueInDays: 10,
    hoursAgo: 7,
    bids: [
      {
        by: 'sneha',
        amount: 2400,
        message: 'I scored 94 in Class 12 maths and have taught two students.',
        availability: 'Mon, Wed, Fri 5 to 6 pm',
      },
    ],
  },
  {
    poster: 'sneha',
    title: 'Move a cupboard and a single bed to the second floor',
    description:
      'Shifting to a new PG two streets away. One steel cupboard, one wooden cot and a mattress. No lift.',
    category: 'Moving',
    budget: 700,
    location: 'Bhawarkua, Indore',
    dueInDays: 3,
    hoursAgo: 11,
    bids: [
      {
        by: 'imran',
        amount: 650,
        message: 'I will bring a helper and the loading rickshaw.',
        availability: 'Saturday 9 am',
      },
    ],
  },
  {
    poster: 'imran',
    title: 'Set up a new Wi-Fi router at a PG',
    description: 'Router is bought. Need it fixed to the wall, configured and the cable tidied up.',
    category: 'Setup',
    budget: 300,
    location: 'MP Nagar, Bhopal',
    dueInDays: 6,
    hoursAgo: 20,
    bids: [],
  },
  {
    poster: 'ramesh',
    title: 'Type 20 pages of handwritten Hindi notes',
    description: 'Clear handwriting. Need a Word file and a PDF. Mangal font.',
    category: 'Typing',
    budget: 250,
    location: 'Khargone',
    dueInDays: 8,
    hoursAgo: 28,
    bids: [
      {
        by: 'sneha',
        amount: 250,
        message: 'I type Hindi in Mangal. Two days.',
        availability: 'Can start tonight',
      },
      { by: 'kavita', amount: 220, message: 'I can finish by Friday.', availability: 'Afternoons' },
    ],
  },
  {
    poster: 'kavita',
    title: 'Collect medicines from the chemist every Saturday',
    description:
      'For my father-in-law. Prescription and money will be given in advance. Four Saturdays.',
    category: 'Errands',
    budget: 200,
    location: 'Borawan',
    dueInDays: 5,
    hoursAgo: 33,
    bids: [],
  },
  {
    poster: 'priya',
    title: 'Repair a noisy ceiling fan',
    description: 'The bedroom fan rattles at speed 3 and above. Might need new bearings.',
    category: 'Electrical',
    budget: 300,
    location: 'Vijay Nagar, Indore',
    dueInDays: 2,
    hoursAgo: 46,
    bids: [
      {
        by: 'ramesh',
        amount: 300,
        message: 'Bearing cost extra if needed, about Rs 80.',
        availability: 'Sunday 11 am',
      },
      { by: 'imran', amount: 450, message: 'Can come next week.', availability: 'Next Tuesday' },
    ],
    hire: 'ramesh',
  },
  {
    poster: 'sneha',
    title: 'Assemble a flat-pack study table',
    description: 'Bought online, 24 screws and a manual that makes no sense.',
    category: 'Assembly',
    budget: 500,
    location: 'Bhawarkua, Indore',
    dueInDays: 1,
    hoursAgo: 120,
    bids: [{ by: 'imran', amount: 450, message: 'Done many of these.', availability: 'Evening' }],
    hire: 'imran',
    complete: true,
    reviews: {
      poster: { rating: 5, comment: 'Quick and careful. Table does not wobble at all.' },
      doer: { rating: 5, comment: 'Clear address, paid on the spot.' },
    },
  },
  {
    poster: 'kavita',
    title: 'Switchboard sparking near the water filter',
    description: 'One socket sparks when the filter is plugged in. Please check the wiring too.',
    category: 'Electrical',
    budget: 450,
    location: 'Borawan',
    dueInDays: 1,
    hoursAgo: 150,
    bids: [
      {
        by: 'ramesh',
        amount: 400,
        message: 'Do not use that socket until I check it.',
        availability: 'Today',
      },
    ],
    hire: 'ramesh',
    complete: true,
    reviews: {
      poster: { rating: 4, comment: 'Fixed properly. Came a little later than said.' },
      doer: { rating: 5, comment: 'Explained the problem well.' },
    },
  },
  {
    poster: 'imran',
    title: 'Design a poster for a mohalla cricket tournament',
    description: 'A3 size, Hindi and English, space for sponsor names.',
    category: 'Design',
    budget: 600,
    location: 'Online',
    dueInDays: 1,
    hoursAgo: 200,
    bids: [{ by: 'sneha', amount: 550, message: 'Two drafts included.', availability: 'Two days' }],
    hire: 'sneha',
    complete: true,
    reviews: {
      poster: { rating: 5, comment: 'Everyone asked who made it.' },
    },
  },
  {
    poster: 'priya',
    title: 'Water the balcony plants for a week',
    description: 'Travelling plans changed, so this is not needed now.',
    category: 'Errands',
    budget: 350,
    location: 'Vijay Nagar, Indore',
    dueInDays: 9,
    hoursAgo: 70,
    bids: [],
    cancel: true,
  },
];
