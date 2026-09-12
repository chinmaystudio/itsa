export type PraxisEvent = {
  id: number;
  name: string;
  overview: string;
  date: string;
  images: string[];
  venue?: string;
  participants?: string;
  highlights?: string[];
  outcome?: string;
  coverImage?: string;
  imageCaptions?: string[];
};

export const PRAXIS_EVENTS: PraxisEvent[] = [
  {
    id: 14,
    name: 'SY, ITSA, IEEE and MLSC Induction 2026',
    overview: 'The Induction Ceremony 2026 for the Department of Information Technology was held on 5th August 2026 at the Mechanical Seminar Hall, PCCoE, Pune. The event brought together 150 students and faculty to welcome new members of SY, ITSA, IEEE and MLSC, while honoring outgoing leaders and celebrating the department’s achievements.',
    date: '5th August, 2026',
    venue: 'Seminar Hall, Mechanical Department, PCCoE, Pune',
    participants: '150 students and faculty',
    highlights: [
      'Welcomed new members of SY, ITSA, IEEE and MLSC.',
      'Introduced students to the IT Department’s academic and co-curricular opportunities.',
      'Recognized FY toppers and felicitated outgoing student leaders.',
      'Introduced the newly appointed ITSA, MLSC and IEEE leadership teams and their vision.',
      'Recognized former core members and introduced new core teams, leads and co-leads.',
      'Concluded with the Oath Ceremony and Vote of Thanks.',
    ],
    outcome: 'Induction 2026 was more than a ceremony—it was a celebration of leadership, legacy and the unstoppable spirit of the IT Department, setting the tone for a year of innovation and collaboration. Students were encouraged to actively participate in technical, extracurricular and professional development activities.',
    images: Array.from({ length: 10 }, (_, index) => `/events/induction-2026/image${index + 1}.png`),
    coverImage: '/events/induction-2026/image10.png',
    imageCaptions: ['ITSA logo', 'PCCOE logo', 'IEEE logo', 'MLSC logo'],
  },
  {
    id: 1,
    name: 'BRUTEFORGE - Code Rush',
    overview: 'The first round was a quiz-based challenge featuring binary puzzles, logical reasoning questions, and applied AI problems. Around sixteen teams participated, and their performance was judged on accuracy and completion time. After an intense one-hour session, only seven to eight teams qualified for the next round.',
    date: '17th September, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge4_imqjiy.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284685/bruteforge1_n1bij2.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284685/bruteforge2_fx1arg.jpg',
    ],
  },
  {
    id: 2,
    name: 'BRUTEFORGE - AI Innovation Forge',
    overview: 'The second round was a problem-solving challenge that tested participants’ creativity and technical skills. Teams worked on problems related to AI, machine learning, and data science, with judging based on originality, effectiveness, critical thinking, and teamwork.',
    date: '17th September, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285089/IMG_20250917_123800_eslxqc.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285089/IMG_20250917_122542_lnkhut.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285091/20250917_20802PMByGPSMapCamera_eqpddx.jpg',
    ],
  },
  {
    id: 3,
    name: 'Webcrafter',
    overview: 'WebCrafter, held during Abhidnya 2.0 at PCCOE, was a web-development competition organized by ITSA. QuizCraft was followed by Auction & Build, where participants bid for resources and developed a basic frontend project.',
    date: '17th September, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285629/IMG_4242_sqqb7t.heic',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285629/IMG_4263_lb6gtl.heic',
    ],
  },
  {
    id: 4,
    name: 'AI Workshop',
    overview: 'The Department of IT, PCCoE, along with IEEE Student Branch and ITSA, organized an expert session on “Using AI in Day-to-Day Life” on 21st July 2025, delivered by Mr. Ajay Deshpande. The session covered AI in healthcare, education, transport, productivity, recommendation systems, voice assistants, automation, and responsible AI usage.',
    date: '21st July, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285805/IMG-20250721-WA0037_xdw02t.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285804/IMG-20250721-WA0013_jrh0dn.jpg',
    ],
  },
  {
    id: 5,
    name: 'Diya Painting Workshop',
    overview: '',
    date: '10th October, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286254/IMG_20251010_163917_ayt43a.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286254/IMG_20251010_160938_h3etpj.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286253/IMG_20251010_162139_a0ubyf.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286407/IMG_20251010_160729_hc8lzm.jpg',
    ],
  },
  {
    id: 6,
    name: 'Higher Studies Sessions & GATE Mock Exam',
    overview: 'The session guided students interested in higher education abroad, especially in the United States, with information about the GRE exam, preparation strategies, resources, and the application process. Students gained a clearer understanding of examination structure and preparation paths.',
    date: '5th September, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286535/Gre_session_-1_vdcjte.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286535/Gate_exam_jz4kpg.jpg',
    ],
  },
  {
    id: 7,
    name: 'IEEE Membership Drive',
    overview: 'The IEEE Awareness & Membership Drive introduced students to IEEE and its benefits. Speakers highlighted technical growth, research exposure, industry connectivity, IEEE societies, and ways to get involved, followed by student experiences and an engaging Q&A session.',
    date: '24th September, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286668/20250924_35139PMByGPSMapCamera_tsrwqi.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286666/IMG_20250924_164541_obldfo.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286761/IMG_20250924_153852_xk11zy.jpg',
    ],
  },
  {
    id: 8,
    name: 'Induction',
    overview: 'The Induction Ceremony 2025 for the IT Department welcomed new members of SY, ITSA, IEEE, and MLSC and appreciated outgoing leaders and achievers. The ceremony launched Tech Pulse 2025, introduced newly appointed committees, felicitated FY toppers, and concluded with an Oath of Responsibility and Vote of Thanks.',
    date: '30th July, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760293241/Screenshot_2025-10-12_234936_cl6day.png',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760293240/Screenshot_2025-10-12_235007_fys9jh.png',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760293240/Screenshot_2025-10-12_234951_y8ocf8.png',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760293239/Screenshot_2025-10-12_234927_pfacib.png',
    ],
  },
  {
    id: 9,
    name: 'Tree Plantation',
    overview: 'The Tree Plantation Drive celebrating ICCUBEA and IMACE 2025 was held at Durga Tekdi, Nigdi, in collaboration with NSS. With 25 students, faculty members, and volunteers, 300 saplings were planted, promoting environmental awareness, teamwork, and ecological responsibility.',
    date: '21st August, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287452/IMG_3669_gvcze9.heic',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287453/IMG_3640_giiwe6.heic',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287456/IMG_3632_go6sjj.heic',
    ],
  },
  {
    id: 10,
    name: 'Teacher’s Day',
    overview: 'On 8th September 2025, the IT Department celebrated Teacher’s Day with ITSA, IEEE Student Chapter, MLSC, and GDGC. Students presented greeting cards and gifts, faculty members were felicitated, and the celebration included fun activities such as Chinese Whisper and Pick the Prop.',
    date: '8th September, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287641/IMG_20250908_171443_yxrq1z.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287639/IMG_20250908_160258_yexfb7.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287639/IMG_20250908_155928_qrs2cl.jpg',
    ],
  },
  {
    id: 11,
    name: 'NSS School Activity',
    overview: 'The NSS Unit of the IT Department conducted an Awareness Drive at Z.P. School, Newale Wasti. A seventh-standard Essay Writing Competition encouraged expression and critical thinking, while certificates, pens, and gifts recognized participating students.',
    date: '6th October, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287768/IMG-20251006-WA0114_qpdj8o.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287769/IMG-20251006-WA0101_ttnptp.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287769/IMG-20251006-WA0093_enyx3i.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760287770/IMG-20251006-WA0099_wcy8qe.jpg',
    ],
  },
  {
    id: 12,
    name: 'NSS Cleanliness Activity',
    overview: 'The NSS Unit of the IT Department conducted a Cleanliness Drive at Ganesh Talav during Ganesh Visarjan. Volunteers cleaned the premises, guided devotees to dispose of offerings responsibly, and promoted cleanliness, social responsibility, and teamwork.',
    date: '6th September, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760289086/IMG-20250906-WA0020_qyw70l.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760289086/IMG-20250906-WA0010_xbrmqp.jpg',
    ],
  },
  {
    id: 13,
    name: 'TechRoom and Inauguration',
    overview: 'ITSA and MLSC launched Techroom 2.0 on 18th August 2025, followed by hands-on sessions on IoT, Canva and Figma, and Object-Oriented Programming. The initiative created collaborative learning spaces in Rooms 5403 and 5404 and strengthened practical skills.',
    date: '18th August, 2025',
    images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760288896/Screenshot_2025-10-12_223747_ypc6vk.png',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760288895/Screenshot_2025-10-12_223727_ufbz5r.png',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760288331/Screenshot_2025-10-12_222823_qyl5wg.png',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760288430/Screenshot_2025-10-12_222905_ju2xyr.png',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760288430/Screenshot_2025-10-12_222916_ylhhot.png',
    ],
  },
];

export const PRAXIS_LEADS = [
  ['Bhagyesh Mali', 'President', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676914/IMG-20250822-WA0294_yd6rp1.jpg'],
  ['Vedant Sarode', 'Technical Team Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676977/Vedant_Sarode_omvwyd.jpg'],
  ['Shriya Marlegaonkar', 'Technical Team Co-Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676963/Shriya_Marlegaonkar_aoinh9.jpg'],
  ['Vikas Shirsath', 'Webmasters Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676975/Vikas_Shirsath_ib2frq.jpg'],
  ['Pradnya Kulkarni', 'Webmasters Co-Lead', 'https://res.cloudinary.com/dtmrnm1lq/image/upload/v1760260880/Pradnya_Kulkarni_1_q6rncg.png'],
  ['Pratik Mulik', 'Event Management & Logistics Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676933/Pratik_Mulik_tvrbnx.jpg'],
  ['Vansh Raina', 'Event Management & Logistics Co-Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676574/Vansh_Sanjay_Raina_jbwgyy.jpg'],
  ['Saniya Patil', 'Event Documentation Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676575/Saniya_Patil_bow7ng.jpg'],
  ['Vedant Kengale', 'Event Documentation Co-Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676974/Vedant_Kengale_im1ggx.jpg'],
  ['Gauri Chavan', 'Design Team Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676915/Gauri_Chavan_uoziga.jpg'],
  ['Shreya Birla', 'Publicity Team Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676961/Shreya_birla_wnarh6.jpg'],
  ['Shruti Jadhav', 'Publicity Team Co-Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676569/Shruti_Jadhav_e6xar4.jpg'],
  ['Om Shelke', 'Sports Department Lead', 'https://res.cloudinary.com/devyriv6o/image/upload/v1759676937/Om_shelke_mmq1ts.jpg'],
];
