export const pathSteps = [
  { title: "Welcome", body: "A calm start.", status: "done" as const },
  { title: "Orientation", body: "Start with what matters.", status: "done" as const },
  { title: "You Are Here", body: "See your landscape.", status: "done" as const },
  { title: "Plan Your Route", body: "Five routes. Many ways.", status: "done" as const },
  {
    title: "Opportunity & Next Steps",
    body: "Clarify, connect, and commit.",
    status: "current" as const,
  },
];

export const goal = {
  label: "Change a habit / lifestyle",
  caption: "Small shifts. Real change.",
};

export const progress = {
  completed: 5,
  total: 6,
  note: "You're building momentum. Keep going.",
};

export const opportunity = {
  title: "Plant-Based Cooking Class",
  subtitle: "A hands-on class to build simple, satisfying meals you'll actually enjoy.",
  badges: ["In-Person", "Group Experience", "Beginner Friendly", "90 min"],
  whyAppeared: {
    chosen: "Change a habit / lifestyle",
    body: "This aligns with your goal to eat with more intention, feel better day-to-day, and build confidence in the kitchen.",
  },
  mayClarify: [
    "What plant-forward eating feels like for you",
    "Which flavors and meals you enjoy most",
    "What changes feel easy vs. hard",
    "Who you enjoy learning and doing with",
  ],
  location: {
    name: "Greenhouse Kitchen Studio",
    address: "123 Market St, Portland, OR",
    hostedBy: "Greenhouse Kitchen",
  },
  effort: {
    level: "Low" as const,
    duration: "About 1.5 hours",
  },
  mayOpenNext: [
    "Join a local vegetarian meetup",
    "Try a grocery planning workshop",
    "Connect with a nutrition coach",
    "Build a weekly meal rhythm",
  ],
  tradeoffs: [
    "Time out of your week",
    "Upfront cost",
    "May not match your taste",
    "Group setting may feel new",
  ],
  trust: {
    level: 4,
    source: "Pathoro Community",
    verifiedBy: 24,
    lastConfirmed: "2 days ago",
  },
  notes: [
    {
      quote: "Great for beginners. I left with 3 easy recipes I've made every week since!",
      author: "Leah, Portland",
    },
    {
      quote: "Loved the pace. No pressure, just good food and good people.",
      author: "Marcus, Portland",
    },
    {
      quote: "Booked a follow-up meetup with two people I met in class.",
      author: "Priya, Portland",
    },
  ],
  notesTotal: 18,
  relatedOpenings: [
    { title: "Vegetarian Meetup (Portland)", effort: "Low" as const },
    { title: "Grocery Planning Workshop", effort: "Medium" as const },
    { title: "Nutrition Coach Intro Call", effort: "Low" as const },
  ],
};

export const routeContext = {
  title: "Real Openings Route",
  summary: "Step into real-world openings.",
  before: "Step into real-world openings",
  current: "Find a class or public commitment",
  next: "Join a workshop or event",
  note: "This opportunity was surfaced from this route.",
};

export const nextSteps = [
  {
    id: "immediate",
    number: 1,
    title: "Immediate next step",
    body: "View upcoming class dates and details.",
    action: "View class options",
    style: "primary" as const,
  },
  {
    id: "backup",
    number: 2,
    title: "Backup option",
    body: "If no dates work, join the waitlist or find a similar class.",
    action: "Join waitlist instead",
    style: "secondary" as const,
  },
  {
    id: "reflection",
    number: 3,
    title: "Follow-up reflection",
    body: "After the class, take 2 minutes to capture what clicked.",
    action: "Reflect after",
    style: "secondary" as const,
  },
];

export const trailNote = {
  body: "I want to cook more at home and feel more energized. I learn best by doing with others.",
  addedOn: "Added May 20, 2025",
};

export const statusBar = [
  {
    id: "here",
    title: "You are here",
    body: "Opportunity & next steps",
  },
  {
    id: "paths",
    title: "Available paths",
    body: "Keep exploring",
  },
  {
    id: "saved",
    title: "Saved for later",
    body: "2 opportunities",
  },
  {
    id: "marker",
    title: "Trail marker",
    body: "Plant-based living",
  },
];
