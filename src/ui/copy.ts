/**
 * Every player-facing string lives here so it can be localized later.
 * Voice: warm, short, a little whimsical.
 */
import type { AwaySummary, CallReason, Form, GameId, LifeMode, MistakeReason } from '../sim';
import { FORM_NAMES } from '../sim';

export const formName = (f: Form) => FORM_NAMES[f] ?? f;

export const NAMES = [
  'Pebble',
  'Fennel',
  'Mallow',
  'Wisp',
  'Juniper',
  'Tuft',
  'Bramble',
  'Lumi',
  'Clover',
  'Sorrel',
  'Thistle',
  'Moth',
  'Puddle',
  'Basil',
  'Willow',
  'Acorn',
  'Nettle',
  'Fable',
  'Dewey',
  'Hazel',
  'Rowan',
  'Pip',
  'Quill',
  'Marigold',
  'Birch',
  'Sage',
  'Ember',
  'Ivy',
  'Bumble',
  'Linden',
  'Saffron',
  'Teasel',
  'Wren',
  'Poppy',
  'Burdock',
  'Cress',
  'Fig',
  'Ripple',
  'Sprocket',
  'Tansy',
  'Yarrow',
  'Bloom',
  'Lichen',
  'Murmur',
  'Nib',
  'Oakley',
  'Plum',
  'Rue',
  'Sedge',
  'Twig',
];

export const copy = {
  appName: 'Mossling',
  tagline: 'A tiny creature of moss, moth and pond-light.',

  onboarding: [
    {
      title: 'You found a Dewstone…',
      body: 'At the edge of a forest pond, something smooth and jade-green is glowing softly.',
    },
    {
      title: 'Something is inside.',
      body: 'Its light pulses like a heartbeat. It brightens when you are near.',
    },
    {
      title: 'Take care of it.',
      body: 'Feed it, play with it, keep the Hollow clean and dim the lantern at night. It will grow into whoever your care helps it become.',
    },
  ],
  onboardingNext: 'Next',
  onboardingBegin: 'Carry it home',
  onboardingSkip: 'Skip',

  nudge: {
    egg: (e: string) => `Tap the ${e}`,
    feed: 'It looks hungry: try Feed',
    pet: 'Give it a gentle pat',
  },

  naming: {
    title: 'What will you call this little one?',
    placeholder: 'A name…',
    random: 'Suggest a name',
    confirm: 'That’s the one',
  },

  actions: {
    feed: 'Feed',
    play: 'Play',
    bathe: 'Bathe',
    lights: 'Lantern',
    medicine: 'Medicine',
    discipline: 'Scold',
    praise: 'Praise',
    status: 'Status',
  },
  actionHints: {
    feed: 'Offer a meal or a snack',
    play: 'Play a little game',
    bathe: 'Wash the Hollow (and your little one)',
    lights: 'Light or dim the lantern',
    medicine: 'A mushroom tonic for when it’s unwell',
    discipline: 'For fibbing calls and fussy refusals',
    praise: 'For good behaviour',
    status: 'Open the field notebook',
  },

  foods: {
    dewberry_mash: { name: 'Dewberry Mash', desc: '+1 ♥ hunger · +1 g' },
    mossbread: { name: 'Mossbread', desc: '+1½ ♥ hunger · +2 g' },
    honeydrop: { name: 'Honeydrop Candy', desc: '+½ ♥ happy · +2 g' },
  },
  feedTitle: 'What’s for supper?',

  games: {
    'which-way': { name: 'Which Way?', desc: 'Guess where it will look. 5 rounds.' },
    'firefly-catch': { name: 'Firefly Catch', desc: 'Tap the fireflies before they fade.' },
    'lilypad-hop': { name: 'Lilypad Hop', desc: 'Tap when the lilypad glows.' },
  } satisfies Record<GameId, { name: string; desc: string }>,
  playTitle: 'Let’s play!',
  tooLittle: (n: string) => `${n} is too little to play! Try petting instead.`,
  tooTired: (n: string) => `${n} is too sleepy to play right now.`,
  tooSick: (n: string) => `${n} doesn’t feel well enough to play.`,
  asleep: (n: string) => `${n} is fast asleep. Shh.`,

  toasts: {
    call: {
      hunger: (n: string) => `${n}’s tummy is rumbling like distant thunder.`,
      happiness: (n: string) => `${n} is moping. It could use some company.`,
      sick: (n: string) => `${n} is shivering. It needs medicine.`,
      lights: (n: string) => `${n} is asleep. Dim the lantern?`,
      false: (n: string) => `${n} is calling… but nothing seems wrong.`,
    } satisfies Record<CallReason, (n: string) => string>,
    refuse: {
      full: (n: string) => `${n} is full to the sprout.`,
      moody: (_n: string, f: string) => `${f} turns up its sprout at that.`,
      asleep: (n: string) => `${n} is asleep.`,
      sick: (n: string) => `${n} is too poorly for that.`,
      'too-young': (n: string) => `${n} is too little for that.`,
      tired: (n: string) => `${n} is too tired.`,
    },
    ate: (n: string) => `${n} ate every crumb. Mmf.`,
    snacked: (n: string) => `${n}’s eyes went all sparkly.`,
    stomachache: (n: string) => `Too many sweets! ${n} has a stomachache.`,
    sick: (n: string) => `${n} is feeling poorly.`,
    medicine: (n: string, left: number) =>
      left > 0
        ? `${n} made a face. ${left} more dose${left > 1 ? 's' : ''} to go.`
        : `${n} feels better!`,
    medicineRefused: (n: string) => `${n} isn’t sick. It wrinkles its nose at the tonic.`,
    cleaned: 'Squeaky clean!',
    bathed: (n: string) => `${n} is fresh as morning dew.`,
    clover: 'You found a four-leaf clover in the bubbles!',
    scoldRight: (n: string) => `${n} looks sheepish. Lesson learned.`,
    scoldWrong: (n: string) => `${n} doesn’t understand what it did wrong…`,
    praised: (n: string) => `${n} glows with pride.`,
    praiseEmpty: (n: string) => `${n} blinks at you, a little confused.`,
    asleepNow: (n: string) => `${n} curled up in the burrow.`,
    awake: (n: string) => `${n} is awake! Good morning.`,
    mistake: {
      hunger: (n: string) => `${n} went hungry for too long.`,
      happiness: (n: string) => `${n} felt lonely for too long.`,
      lights: (n: string) => `The lantern kept ${n} from sleeping well.`,
      sick: (n: string) => `${n} has been sick for a long while.`,
    } satisfies Record<MistakeReason, (n: string) => string>,
    birthday: (n: string, age: number) => `Happy birthday, ${n}! Age ${age}.`,
    pooped: (n: string) => `${n} left a little moss pellet.`,
    pauseOn: 'Babysitter is watching. Time is paused.',
    pauseOff: 'You’re back. Time flows again.',
    pauseExhausted: 'The babysitter has gone home for today.',
    won: (n: string) => `${n} won!`,
    lost: (n: string) => `${n} had fun anyway.`,
    goldenFirefly: 'A golden firefly! It’s in your Journal.',
    wish: (n: string) => `${n} made a wish on a falling star.`,
    saved: 'Save exported.',
    imported: 'Save imported. Welcome back.',
    importFailed: (why: string) => `That save couldn’t be read: ${why}`,
    photoSaved: 'Photo saved.',
  },

  announce: {
    hungry: (n: string) => `${n} is hungry.`,
    unhappy: (n: string) => `${n} is unhappy.`,
    sick: (n: string) => `${n} is sick.`,
    dirty: (_n: string) => `The Hollow needs cleaning.`,
    asleep: (n: string) => `${n} is asleep.`,
  },

  hud: {
    age: (a: number) => `Age ${a}`,
    paused: 'Paused',
    menu: 'Menu',
    journal: 'Journal',
    settings: 'Settings',
    photo: 'Photo mode',
    mute: 'Mute',
    unmute: 'Unmute',
    bell: 'Your little one is calling for you',
  },

  status: {
    title: 'Field Notebook',
    pages: ['Needs', 'Manners', 'Growth', 'Bond'],
    hunger: 'Hunger',
    happiness: 'Happy',
    energy: 'Energy',
    hygiene: 'Tidiness',
    discipline: 'Discipline',
    weight: 'Weight',
    age: 'Age',
    form: 'Form',
    bond: 'Bond',
    bondLocked: 'The bond between you grows quietly. You’ll be able to read it when it’s grown up.',
    mistakes: 'Care slips',
    health: (sick: boolean) => (sick ? 'Feeling poorly' : 'In good health'),
    years: (a: number) => `${a} ${a === 1 ? 'year' : 'years'}`,
  },

  away: {
    title: 'While you were away…',
    close: 'Hello again',
    pooped: (n: string, c: number) => `${n} pooped ${c} time${c > 1 ? 's' : ''}.`,
    hungry: (n: string, c: number) =>
      `${n} got hungry and called for you ${c === 1 ? 'once' : `${c} times`}.`,
    lonely: (n: string, c: number) => `${n} felt lonely ${c === 1 ? 'once' : `${c} times`}.`,
    fibbed: (n: string, c: number) =>
      `${n} called for no reason ${c === 1 ? 'once' : `${c} times`} (cheeky).`,
    sick: (n: string) => `${n} caught a chill.`,
    slept: (_n: string, from: string, to: string) => `It slept from ${from} to ${to}.`,
    evolved: (n: string, f: string) => `${n} grew into a ${f}!`,
    hatched: 'The egg hatched!',
    birthday: (n: string) => `${n} had a birthday.`,
    calm: (n: string) => `${n} pottered about the Hollow, perfectly content.`,
    mistakes: (c: number) => `${c} care slip${c > 1 ? 's' : ''} noted in the notebook.`,
    ended: {
      left: (n: string) => `${n} returned to the forest.`,
      ranaway: (n: string) => `${n} wandered off into the ferns.`,
      passed: (n: string) => `${n} fell asleep beneath the fern for the last time.`,
    },
  },

  cinematic: {
    skip: 'Skip',
    evolved: (old: string, next: string) => [old, ' evolved into ', next, '!'] as const,
    adultIntro: 'Something is changing…',
    starwickIntro: 'The night sky leans close…',
    leaveGentle: (f: string) =>
      `${f} looked back at you once more, and then the ferns closed softly behind it. It left you something.`,
    leaveRanAway: (n: string) =>
      `${n} slipped away into the ferns. It left a note: “I’ll be all right. Please look after the egg.”`,
    passed: (n: string) =>
      `${n} fell asleep beneath the great fern and didn’t wake. The leaves fell softly around a small stone.`,
    newEgg: (e: string) => `A ${e} glows where it stood.`,
    continue: (e: string) => `Pick up the ${e}`,
  },

  greeting: (n: string) => `${n} missed you!`,

  notif: {
    title: 'Can I send you little notes?',
    body: (n: string) =>
      `I can tap you on the shoulder when ${n} is hungry or it’s bedtime and the lantern is still on. Only now and then, never at night.`,
    yes: 'Yes, please',
    no: 'Not now',
    hungry: (n: string) => `${n} is getting peckish.`,
    bedtime: (n: string) => `${n} is getting sleepy. Lights off soon?`,
  },

  journal: {
    title: 'Journal',
    tabs: ['Forms', 'Memory Leaves', 'Treasures', 'Timeline'],
    unknown: '???',
    unknownHint: 'Not yet met',
    noLeaves: 'No Memory Leaves yet. Every little one leaves one when it moves on.',
    leafHow: {
      left: 'Returned to the forest',
      ranaway: 'Wandered away',
      passed: 'Rests beneath the fern',
      released: 'Released to the forest',
    },
    goldenFirefly: 'Golden fireflies',
    clover: 'Four-leaf clovers',
    wishes: 'Wishes on falling stars',
    noTimeline: 'Your care story begins with the first egg.',
    lifetime: 'Lifetime',
  },

  settings: {
    title: 'Settings',
    sound: 'Sound',
    music: 'Music',
    sfx: 'Sound effects',
    mute: 'Mute everything',
    notifications: 'Gentle reminders',
    notificationsDenied: 'Notifications are blocked in your browser settings.',
    lifeMode: 'Life mode',
    lifeModes: {
      gentle: {
        name: 'Gentle',
        desc: 'Grown-ups return to the forest when their time comes, or wander off if neglected.',
      },
      classic: { name: 'Classic', desc: 'Original handheld rules. Neglect can be fatal.' },
      eternal: { name: 'Eternal', desc: 'Your grown-up never leaves.' },
    } satisfies Record<LifeMode, { name: string; desc: string }>,
    babysitter: 'Babysitter (pause time)',
    babysitterDesc: (left: string) => `Freezes time for up to 12 hours a day. ${left} left today.`,
    reducedMotion: 'Reduced motion',
    rm: { system: 'Match system', on: 'On', off: 'Off' },
    deviceMode: 'Device Mode',
    deviceModeDesc: 'Frame the Hollow in a little river-stone handheld.',
    textSize: 'Text size',
    sizes: { s: 'Small', m: 'Medium', l: 'Large' },
    haptics: 'Vibration',
    save: 'Your save',
    export: 'Export save',
    import: 'Import save',
    release: 'Release to the forest…',
    releaseConfirm1:
      'Your little one will go to live in the forest, and you will start again with a new egg.',
    releaseConfirm2: 'Are you sure? This can’t be undone.',
    releaseYes: 'Yes, release it',
    releaseNo: 'Keep it',
    replayIntro: 'Replay introduction',
    credits: 'Credits',
    updates: 'Updates',
    version: (v: string) => `Version: ${v}`,
    checkUpdates: 'Check for updates',
    reloadToUpdate: 'Reload to update',
    reloadNote: 'Your game is saved first; nothing is lost.',
    creditsBody:
      'Mossling was made with care. All sounds and music are synthesized live in your browser. Placeholder art is drawn in code; illustrations drop in from the art pipeline.',
    close: 'Done',
  },

  photo: {
    caption: (n: string, f: string, age: number) => `${n} the ${f} · age ${age}`,
    save: 'Save photo',
    exit: 'Back',
  },

  minigame: {
    ready: 'Ready?',
    go: 'Go!',
    pause: 'Pause',
    paused: 'Paused',
    resume: 'Resume',
    quit: 'Leave game',
    best: (b: number) => `Best: ${b}`,
    newBest: 'New best!',
    again: 'Play again',
    done: 'Back to the Hollow',
    score: 'Score',
    whichWay: {
      prompt: 'Which way will it look?',
      left: 'Left',
      right: 'Right',
      right_: 'Got it!',
      wrong: 'Nope!',
      round: (r: number) => `Round ${r} of 5`,
    },
    firefly: {
      combo: (c: number) => `×${c}`,
      hint: 'Tap fireflies before they fade',
      keyHint: 'Arrow keys + Space work too',
    },
    lilypad: {
      hint: 'Tap (or Space) when the lilypad glows',
      splash: 'Splash!',
      lives: 'Lives',
    },
  },

  bath: {
    hint: 'Scrub! Drag over the bubbles',
    done: 'All clean',
  },

  dev: { title: 'Dev Panel' },

  aria: {
    pet: (n: string) => `${n}. Tap or drag to pet.`,
    egg: (e: string) => `The ${e}. Tap it.`,
    dropping: 'A moss pellet',
    star: 'A falling star. Tap it to make a wish.',
  },

  wishes: [
    'a mountain of dewberries',
    'to fly with the moths',
    'a pond full of stars',
    'you to stay a little longer',
    'a mushroom umbrella',
    'a snail friend',
    'snow that tastes like honey',
    'to never have a bath',
  ],
};

export function awayLines(name: string, s: AwaySummary, fmt: (ms: number) => string): string[] {
  const a = copy.away;
  const out: string[] = [];
  if (s.hatched) out.push(a.hatched);
  if (s.poops) out.push(a.pooped(name, s.poops));
  if (s.hungerCalls) out.push(a.hungry(name, s.hungerCalls));
  if (s.happinessCalls) out.push(a.lonely(name, s.happinessCalls));
  if (s.falseCalls) out.push(a.fibbed(name, s.falseCalls));
  if (s.gotSick) out.push(a.sick(name));
  for (const sl of s.sleeps) out.push(a.slept(name, fmt(sl.from), fmt(sl.to)));
  for (const f of s.evolvedTo) out.push(a.evolved(name, formName(f as Form)));
  if (s.birthdays) out.push(a.birthday(name));
  if (s.mistakes) out.push(a.mistakes(s.mistakes));
  if (s.ended) out.push(a.ended[s.ended](name));
  if (!out.length) out.push(a.calm(name));
  return out;
}
