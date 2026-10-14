import { CallScheduleItem, ChatMessage, GitaSloka, TaskReminder } from '../types';

export const INITIAL_REMINDERS: TaskReminder[] = [
  {
    id: 'rem-1',
    title: 'Client Call - Siva',
    time: 'Today • 6:00 PM',
    category: 'calls',
    enabled: true,
    completed: false,
    isToday: true,
  },
  {
    id: 'rem-2',
    title: 'Gym Workout',
    time: 'Today • 6:30 PM',
    category: 'workout',
    enabled: true,
    completed: false,
    isToday: true,
  },
  {
    id: 'rem-3',
    title: 'College Assignment',
    time: 'Tomorrow • 10:00 AM',
    category: 'education',
    enabled: true,
    completed: false,
    isToday: false,
  },
  {
    id: 'rem-4',
    title: 'Design T-shirt Mockups',
    time: 'Tomorrow • 2:00 PM',
    category: 'design',
    enabled: true,
    completed: false,
    isToday: false,
  },
  {
    id: 'rem-5',
    title: 'Business Meeting',
    time: 'Tomorrow • 5:00 PM',
    category: 'business',
    enabled: true,
    completed: false,
    isToday: false,
  },
  {
    id: 'rem-6',
    title: '3D Printing Filament Audit',
    time: 'Friday • 4:00 PM',
    category: 'business',
    enabled: false,
    completed: true,
    isToday: false,
  },
];

export const GITA_SLOKAS: GitaSloka[] = [
  {
    id: 'gita-2-47',
    chapter: 2,
    verse: 47,
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥',
    transliteration: 'Karmaṇy-evādhikāras te mā phaleṣhu kadāchana\nmā karma-phala-hetur bhūr mā te saṅgo ’stvakarmaṇi',
    tamilPronunciation: 'கர்மண்யேவாதிகாரஸ்தே மா பலேஷு கதாசன |\nமா கர்மபலஹேதுர்பூர்மா தே ஸங்கோऽஸ்த்வகர்மணி ||',
    tamilMeaning: 'கடமையைச் செய்ய மட்டுமே உனக்கு அதிகாரம் உண்டு, அதன் பலன்களில் ஒருபோதும் இல்லை. பலன்களுக்கு உன்னை காரணமாக நினைக்காதே, செயலின்மையிலும் பற்று வைக்காதே.',
    englishMeaning:
      'You have the right to perform your duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.',
    modernApplication:
      'Focus 100% of your mental energy on doing the work with world-class discipline—coding, studying, or building your 3D printing business—without getting paralyzed by anxiety over immediate financial reward or external praise.',
    realLifeExample:
      'When pitching to client Siva: deliver the most thoughtful, thorough proposal possible, then step back calmly without dwelling on desperation. Pure execution creates superior outcomes.',
    audioDuration: '0:34',
  },
  {
    id: 'gita-2-14',
    chapter: 2,
    verse: 14,
    sanskrit: 'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः ।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत ॥',
    transliteration: 'mātrā-sparśhās tu kaunteya śhītoṣhṇa-sukha-duḥkha-dāḥ\nāgamāpāyino ’nityās tans-titikṣhasva bhārata',
    tamilPronunciation: 'மாத்ராஸ்பர்ஷாஸ்து கௌந்தேய ஷீதோஷ்ணஸுகதுக்கதா: |\nஆகமாபாயினோऽநித்யாஸ்தாம்ஸ்திதிக்ஷஸ்வ பாரத ||',
    tamilMeaning: 'குளிர், வெப்பம், இன்பம், துன்பம் போன்றவை தற்காலிகமானவை. அவற்றைப் பொறுத்துக்கொண்டு முன்னேறு.',
    englishMeaning:
      'The contact between the senses and sense objects gives rise to fleeting sensations of happiness and distress. These are impermanent, appearing and disappearing like winter and summer. Learn to endure them with equanimity.',
    modernApplication:
      'Tough days in college or slow sales in entrepreneurship are merely passing seasons. Do not quit during the winter; emotional resilience is built by staying steady.',
    realLifeExample:
      'When tired after a long college day, still show up to the gym. The temporary discomfort passes, leaving lasting physical and mental strength.',
    audioDuration: '0:29',
  },
  {
    id: 'gita-6-5',
    chapter: 6,
    verse: 5,
    sanskrit: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥',
    transliteration: 'uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hyātmano bandhur ātmaiva ripur ātmanaḥ',
    tamilPronunciation: 'உத்தரேதாத்மனாத்மானம் நாத்மானமவஸாதயேத் |\nஆத்மைவ ஹ்யாத்மனோ பந்துராத்மைவ ரிபுராத்மன: ||',
    tamilMeaning: 'உன் மனதினால் உன்னை நீயே உயர்த்திக்கொள்; தாழ்த்திக்கொள்ளாதே. உன் மனமே உனக்கு சிறந்த நண்பன், தவறினால் அதுவே பெரும் எதிரி.',
    englishMeaning:
      'Elevate yourself through the power of your own mind, and do not degrade yourself. For the mind can be the friend of the self, or indeed its greatest enemy.',
    modernApplication:
      'Self-talk governs destiny. Replace doom-scrolling and self-doubt with deliberate high-standard habits and structured daily planning.',
    realLifeExample:
      'Using HELIOZ morning and evening calls to align thoughts creates self-mastery instead of mental chaos.',
    audioDuration: '0:31',
  },
];

export const CALL_SCHEDULES: CallScheduleItem[] = [
  {
    id: 'call-morning',
    title: 'Morning Call',
    time: '7:30 AM',
    enabled: true,
    bannerImage: '/src/assets/images/morning_sunrise_mountains_1791894140131.jpg',
    bulletPoints: [
      'Motivation & Positive Mindset Awakening',
      'Daily Goals & High-Impact Priority Planning',
      'Personal Development Micro-Lesson',
      'Daily Gita Sloka chanting + Modern Context',
    ],
  },
  {
    id: 'call-evening',
    title: 'Evening Call',
    time: '8:00 PM',
    enabled: true,
    bannerImage: '/src/assets/images/starry_evening_moon_1791894139806.jpg',
    bulletPoints: [
      'Daily Performance & Execution Review',
      "Tomorrow's Priority Scheduling",
      'Mistakes, Learnings & Gratitude Journal',
      'Reflective Gita Sloka integration',
    ],
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    sender: 'user',
    text: 'What should I do today?',
    timestamp: '9:41 AM',
  },
  {
    id: 'chat-2',
    sender: 'helios',
    text: "Alright Santosh! Here's your curated plan for today. Discipline today, freedom tomorrow.",
    timestamp: '9:41 AM',
    checklist: [
      { label: 'Attend college classes (9:00 AM - 1:00 PM)', checked: true },
      { label: 'Work on 3D printing business (2:00 PM - 5:00 PM)', checked: false },
      { label: 'Gym / Strength Workout (6:00 PM)', checked: false },
      { label: 'Call client Siva (7:00 PM)', checked: false },
      { label: 'Learn something new & read Gita (1 hour)', checked: false },
    ],
    quoteNote: "Remember, progress is better than perfection. Let's make it count!",
  },
];
