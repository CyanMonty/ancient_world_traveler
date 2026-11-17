/*
 * Hand-drawn, approximate political territories for each period.
 * Coordinates are [lng, lat]. Outlines may run loosely through the sea, because
 * the map masks the sea anyway.
 *
 * PRIORITY: in each period, powers are listed in priority order. Where two outlines
 * overlap, the earlier power keeps the land (tools/build-territories.js subtracts
 * every earlier power from each later one). So small kingdoms are listed before the
 * empires around them, and only real land borders need to be drawn with care.
 *
 * These are schematic: ancient borders were often zones rather than lines, and
 * control of deserts and mountains was loose.
 */

const C = {
  rome: '#b23a3a',
  romeClient: '#d98b7a',
  persia: '#2f7f6f',
  persiaClient: '#7fb5a6',
  carthage: '#7b4fa0',
  greek: '#3f78b5',
  etruscan: '#d08a3c',
  latin: '#c25b5b',
  kush: '#8a6a3a',
  aksum: '#b0894f',
  garamantes: '#c2a15a',
  nabataea: '#c9a227',
  armenia: '#6f8f3a',
  bosporus: '#5aa0b8',
  osrhoene: '#9aa86a',
  ostrogoth: '#d9a43a',
  vandal: '#8a5aa8',
  visigoth: '#9a6b3c',
  suevi: '#6b8e9e',
  burgundian: '#c7779f',
  frank: '#4a6fb3',
  gepid: '#8c9a5a',
  lombard: '#6a8a6a',
  moor: '#b38a6a',
  arabs: '#c8b06a',
  nubia: '#9a7a4a',
};

const BOSPORUS_RING = [[35.0, 44.8], [38.5, 44.8], [40.0, 47.5], [39.0, 47.6], [37.0, 46.1], [35.0, 45.6]];
const GARAMANTES_RING = [[11, 25], [17, 25], [17, 28.5], [13, 30], [11, 28.5]];
const AKSUM_RING = [[36.3, 17.0], [39.0, 18.0], [43.5, 12.5], [39, 9], [35.5, 11]];
const SUEVI_RING = [[-10, 41.0], [-8.0, 41.0], [-6.5, 41.6], [-6.0, 42.8], [-7.0, 43.8], [-10, 44.0]];
const NUBIA_RING = [[29.5, 23.9], [34.0, 23.9], [36.5, 18], [36, 14], [32, 14], [29.5, 17]];
const LAKHMID_RING = [[40.0, 33.0], [44.5, 32.3], [46.5, 30.0], [47.5, 28.5], [44, 28], [40, 29.5], [38.6, 31.5]];
const GHASSANID_RING = [[36.8, 33.3], [38.5, 34.2], [39.5, 33.0], [38.5, 31.0], [37.2, 30.5], [36.8, 31.8]];
// Sasanian Empire (drawn generously west; Rome is listed first and keeps its land)
const SASANIAN_RING = [
  [38.5, 36.0], [41.5, 40.0], [41.6, 41.3], [43.5, 42.5], [46.5, 42.0], [49.5, 41.5], [53, 38], [60, 38],
  [60, 25], [57, 25.5], [52, 27.5], [50, 29.5], [48, 29.8], [46.5, 30.0], [44, 31], [42, 32], [40.5, 33.5], [39.5, 34.5],
];

module.exports = {
  colors: C,
  periods: {
    // ------------------------------------------------------------------ 500 BC
    '500bc': [
      {
        id: 'carthage', name: 'Carthage & the Phoenician West', color: C.carthage,
        note: 'Carthage led the western Phoenician cities and controlled the sea lanes from Sardinia to Gadir.',
        rings: [
          [[8.0, 37.5], [11.5, 37.5], [11.5, 35.5], [10.5, 34.0], [11.5, 33.4], [15.5, 32.9], [15.5, 31.0], [13.0, 31.5], [10.0, 33.0], [8.5, 34.5], [8.0, 36.0]],
          [[12.2, 38.3], [13.4, 38.3], [13.2, 37.4], [12.3, 37.5]],
          [[8.0, 38.8], [9.8, 38.8], [9.8, 40.2], [8.3, 40.6], [8.0, 40.0]],
          [[1.1, 38.8], [1.7, 38.8], [1.7, 39.2], [1.1, 39.2]],
          [[14.1, 35.7], [14.7, 35.7], [14.7, 36.15], [14.1, 36.15]],
          [[-6.8, 36.0], [-2.0, 36.6], [-2.0, 37.0], [-4.5, 37.1], [-6.8, 37.1]],
        ],
      },
      {
        id: 'rome', name: 'Roman Republic', color: C.latin,
        note: 'A young republic leading the Latin cities of Latium.',
        rings: [[[12.25, 41.95], [12.6, 42.0], [12.9, 41.9], [13.5, 41.4], [13.0, 41.25], [12.6, 41.45], [12.2, 41.75]]],
      },
      {
        id: 'etruscans', name: 'Etruscan cities', color: C.etruscan,
        note: 'A league of independent Etruscan city-states such as Caere, Veii and Tarquinii.',
        rings: [[[10.2, 44.2], [11.5, 44.8], [12.6, 43.8], [12.7, 42.3], [12.5, 42.0], [12.3, 41.95], [11.7, 42.0], [10.5, 42.9], [10.0, 44.0]]],
      },
      {
        id: 'greeks', name: 'Greek city-states', color: C.greek,
        note: 'Hundreds of independent poleis — Athens, Sparta, Corinth, Syracuse, Massalia and many more — each with its own government.',
        rings: [
          [[20.0, 39.9], [22.5, 40.1], [23.5, 39.3], [24.5, 38.5], [24.5, 36.2], [21.0, 36.2], [20.0, 38.0], [19.6, 39.6]],
          [[23.4, 34.8], [26.4, 34.8], [26.4, 35.7], [23.4, 35.7]],
          [[24.2, 36.3], [26.0, 36.3], [26.0, 37.9], [24.2, 37.9]],
          [[15.5, 41.0], [17.5, 40.7], [18.6, 40.0], [17.0, 38.8], [16.5, 37.8], [15.6, 37.8], [15.6, 38.5], [15.9, 39.5], [14.9, 40.3], [14.6, 40.55], [13.8, 40.7], [13.8, 41.0]],
          [[19.2, 41.1], [19.7, 41.1], [19.7, 41.5], [19.2, 41.5]],
          [[28.4, 43.9], [28.9, 43.9], [28.9, 44.4], [28.4, 44.4]],
          [[12.3, 38.4], [15.8, 38.4], [15.8, 36.5], [12.3, 36.5]],
          [[4.5, 43.0], [7.0, 43.0], [7.0, 43.7], [4.5, 43.7]],
          [[2.9, 41.9], [3.4, 41.9], [3.4, 42.4], [2.9, 42.4]],
          [[31.5, 46.4], [32.3, 46.4], [32.3, 46.9], [31.5, 46.9]],
          [[35.4, 44.9], [37.0, 44.9], [37.0, 45.6], [35.4, 45.6]],
        ],
      },
      {
        id: 'persia', name: 'Achaemenid Persian Empire', color: C.persia,
        note: 'Darius I\'s empire, organised into satrapies, including the Ionian Greeks, Phoenicia, Egypt, Cyrenaica, Thrace and vassal Macedon.',
        rings: [[
          [21.0, 41.2], [22.0, 42.0], [24.0, 42.5], [28.0, 42.8], [32.0, 42.4], [36.0, 42.4], [41.5, 42.3], [44.5, 42.0], [48.5, 41.5],
          [50.5, 37.5], [56, 38], [60, 37.5], [60, 25], [57, 25.5], [52, 27.5], [50, 29.5], [48, 29.8], [46.5, 30.5], [44.5, 31],
          [42, 31.5], [39, 31.5], [37.5, 30.5], [35.5, 29.5], [34.9, 29.5], [34.5, 28.0], [35.0, 27.0], [34.0, 24.0], [32.9, 23.9],
          [30.5, 24.0], [29.0, 25.5], [28.0, 27.0], [27.0, 29.6], [25.0, 29.6], [23.0, 30.0], [20.0, 30.3], [19.5, 31.0], [19.8, 33.0],
          [25.5, 34.5], [25.5, 39.0], [23.5, 39.3], [22.5, 40.1], [20.8, 40.5],
        ]],
      },
      {
        id: 'kush', name: 'Kingdom of Kush', color: C.kush,
        note: 'Nubian kingdom ruled from Napata and Meroë.',
        rings: [[[29.5, 22.5], [33.5, 22.5], [36.5, 18], [36, 14], [32, 14], [29.5, 17]]],
      },
    ],

    // ------------------------------------------------------------------ 0 CE
    '0ce': [
      {
        id: 'herodian', name: 'Herodian kingdoms (Roman clients)', color: C.romeClient,
        note: 'After Herod the Great died (4 BC), his sons Archelaus, Antipas and Philip ruled Judaea, Galilee and the lands to the north-east as Roman clients.',
        rings: [[[34.6, 31.6], [34.9, 33.1], [35.6, 33.3], [36.4, 33.0], [36.0, 32.0], [35.6, 31.0], [35.3, 30.9], [34.9, 31.0]]],
      },
      {
        id: 'nabataea', name: 'Nabataean Kingdom', color: C.nabataea,
        note: 'The Arab kingdom of Aretas IV, rich from the incense trade, ruled from Petra.',
        rings: [[[34.4, 31.0], [34.9, 30.95], [35.3, 30.85], [35.6, 31.0], [36.0, 32.0], [36.6, 32.7], [37.5, 32.5], [38.5, 30.5], [38.5, 26.5], [37.0, 25.0], [35.8, 27.0], [34.6, 28.0], [34.2, 29.5], [33.9, 30.5]]],
      },
      {
        id: 'mauretania', name: 'Kingdom of Mauretania (Roman client)', color: C.romeClient,
        note: 'Ruled by Juba II and Cleopatra Selene from Iol Caesarea under Augustus\'s protection.',
        rings: [[[-10, 36.0], [-5.7, 36.0], [0, 36.6], [5.5, 37.2], [5.5, 34.0], [0, 33.0], [-6, 31.0], [-10, 30.5]]],
      },
      {
        id: 'thrace', name: 'Kingdom of Thrace (Roman client)', color: C.romeClient,
        note: 'Odrysian client kings ruled inland Thrace until it became a province in AD 46.',
        rings: [[[23.0, 43.3], [28.0, 43.3], [28.2, 41.9], [27.5, 41.4], [26.0, 41.2], [24.5, 41.4], [23.3, 41.8]]],
      },
      {
        id: 'cappadocia', name: 'Kingdom of Cappadocia (Roman client)', color: C.romeClient,
        note: 'King Archelaus ruled Cappadocia for Rome until AD 17.',
        rings: [[[33.8, 39.8], [38.5, 40.2], [39.3, 38.6], [37.4, 37.3], [34.5, 37.3], [33.5, 38.2]]],
      },
      {
        id: 'commagene', name: 'Kingdom of Commagene (Roman client)', color: C.romeClient,
        note: 'Small Hellenistic-Iranian kingdom on the upper Euphrates, annexed in AD 17.',
        rings: [[[37.4, 37.3], [38.0, 38.3], [39.3, 38.0], [38.8, 37.3], [38.1, 37.2]]],
      },
      {
        id: 'bosporus', name: 'Bosporan Kingdom (Roman client)', color: C.bosporus,
        note: 'Greek-Sarmatian kingdom on the Kerch strait, a grain exporter and Roman client.',
        rings: [BOSPORUS_RING],
      },
      {
        id: 'osrhoene', name: 'Osrhoene (Kingdom of Edessa)', color: C.osrhoene,
        note: 'Small Aramaean kingdom of the Abgar dynasty, a buffer between Rome and Parthia.',
        rings: [[[38.3, 37.5], [40.0, 37.5], [40.2, 36.3], [38.3, 36.3]]],
      },
      {
        id: 'armenia', name: 'Kingdom of Armenia (contested)', color: C.armenia,
        note: 'Rome and Parthia competed to install its kings; Augustus\'s grandson Gaius was sent east in AD 1 to settle it.',
        rings: [[[40.3, 40.9], [46.5, 41.5], [48.0, 39.5], [46.0, 38.3], [44.0, 37.6], [41.0, 38.0], [39.3, 38.6]]],
      },
      {
        id: 'rome', name: 'Roman Empire', color: C.rome,
        note: 'Augustus\'s empire: every shore of the Mediterranean, Gaul to the Rhine, and the Alps and Balkans to the Danube.',
        rings: [[
          [-10, 36.5], [-10, 44.5], [-5, 48.8], [-1.5, 50.0], [1.5, 51.3], [4.0, 52.2], [6.0, 51.9], [7.2, 51.1], [7.7, 50.3],
          [8.3, 50.0], [8.4, 48.5], [7.7, 47.6], [9.5, 47.6], [12.0, 48.9], [13.5, 48.6], [14.3, 48.3], [16.0, 48.3],
          [17.0, 48.1], [18.0, 47.8], [18.9, 47.8], [19.1, 47.3], [19.0, 46.0], [19.4, 45.2], [20.4, 44.8], [22.5, 44.6],
          [24.0, 43.7], [26.0, 43.7], [28.0, 44.0], [29.7, 45.2], [30.5, 44.5], [30.0, 42.0], [32, 42.3], [36, 42.3],
          [40.5, 41.3], [39.2, 40.0], [38.5, 38.5], [38.0, 37.4], [38.2, 36.2], [39.0, 35.8], [38.8, 34.0], [37.5, 32.6],
          [36.5, 32.0], [34.9, 29.5], [33.5, 28.0], [34.5, 28.0], [35.5, 24.0], [34.0, 23.0], [29.5, 23.0], [28.0, 25.0],
          [27.5, 29.3], [24.5, 29.5], [22.0, 30.0], [19.0, 30.0], [17.0, 30.5], [15.5, 30.5], [13.0, 30.5], [11.0, 31.5],
          [10.0, 32.5], [9.0, 33.5], [8.0, 34.5], [6.0, 35.0], [5.5, 36.5], [-6, 35.0],
        ]],
      },
      {
        id: 'parthia', name: 'Parthian Empire', color: C.persia,
        note: 'The Arsacid kings ruled from Ctesiphon and Ecbatana over Mesopotamia and Iran, with vassal kingdoms such as Characene.',
        rings: [[
          [40.2, 38.0], [44, 37.5], [48, 39.5], [50, 38], [54, 38.5], [60, 38], [60, 25], [57, 25.5], [52, 27.5], [50, 29.5],
          [48, 29.8], [46.5, 30.0], [44, 31.0], [42.5, 32.0], [41.5, 33.2], [40.5, 34.4], [40.3, 35.0], [39.0, 35.8], [38.2, 36.2],
        ]],
      },
      { id: 'kush', name: 'Kingdom of Kush', color: C.kush, note: 'Meroitic kingdom; it made peace with Augustus in 21/20 BC.', rings: [[[29.5, 23.0], [34.0, 23.0], [36.5, 18], [36, 14], [32, 14], [29.5, 17]]] },
      { id: 'garamantes', name: 'Garamantes', color: C.garamantes, note: 'Saharan kingdom of the Fezzan oases.', rings: [GARAMANTES_RING] },
    ],

    // ------------------------------------------------------------------ 300 CE
    '300ce': [
      {
        id: 'armenia', name: 'Kingdom of Armenia (Roman ally)', color: C.armenia,
        note: 'Tiridates III, restored with Roman backing; Armenia will adopt Christianity c. 301.',
        rings: [[[40.0, 41.3], [46.5, 41.5], [48.0, 39.5], [46.5, 38.5], [44.5, 37.6], [42.5, 38.3], [40.0, 39.0]]],
      },
      { id: 'bosporus', name: 'Bosporan Kingdom (Roman client)', color: C.bosporus, note: 'Client kingdom in eastern Crimea.', rings: [BOSPORUS_RING] },
      {
        id: 'rome', name: 'Roman Empire (Tetrarchy)', color: C.rome,
        note: 'Diocletian\'s reorganised empire of about 100 provinces in 12 dioceses, ruled by four emperors.',
        rings: [[
          [-1.4, 55.05], [3.5, 53.5], [4.2, 52.0], [6.0, 51.9], [7.0, 51.0], [7.6, 50.3], [8.3, 50.0], [8.4, 49.0], [7.6, 47.6],
          [9.3, 47.6], [10.0, 47.7], [10.0, 48.4], [11.0, 48.75], [12.1, 49.0], [13.5, 48.6], [14.3, 48.3], [16.0, 48.2],
          [17.0, 48.1], [18.0, 47.8], [19.2, 47.8], [19.2, 47.0], [19.0, 46.0], [19.6, 45.3], [20.6, 45.0], [22.5, 44.75],
          [24.0, 43.8], [26.0, 43.75], [28.0, 44.1], [29.7, 45.2], [30.5, 44.5], [31, 43], [33, 42.5], [36, 42.4], [40, 41.7],
          [41.3, 41.6], [41.3, 42.5], [42.3, 42.5], [42.5, 41.6], [42.0, 41.0], [44.5, 40.0], [44.0, 37.3], [43.0, 36.8], [42.3, 36.0],
          [41.0, 35.3], [40.6, 34.8], [39.5, 34.0], [38.0, 32.5], [38.5, 30.5], [38.0, 28.0], [36.0, 27.5], [35.0, 28.0],
          [35.5, 24.0], [32.9, 23.95], [30.0, 24.0], [28.0, 25.5], [25.5, 29.5], [24.5, 29.0], [22, 29.8], [19, 30], [16, 30.5],
          [13, 30.5], [11, 31.0], [10, 32.5], [8.5, 33.5], [7, 34.5], [5, 35.0], [2, 35.0], [-1.0, 34.5], [-4.0, 35.0],
          [-5.5, 34.6], [-6.5, 34.6], [-7, 34.0], [-10, 35.0], [-10, 44.5], [-5.0, 48.6], [-6.2, 50.0], [-5.7, 52.1],
          [-5.2, 53.4], [-4.9, 54.6], [-3.5, 55.05],
        ]],
      },
      {
        id: 'sasanian', name: 'Sasanian Empire', color: C.persia,
        note: 'King Narseh, defeated by Galerius in 298, gave up the lands beyond the Tigris in the Peace of Nisibis (299).',
        rings: [SASANIAN_RING],
      },
      { id: 'kush', name: 'Kingdom of Kush (in decline)', color: C.kush, note: 'The Meroitic kingdom in its last century.', rings: [[[29.5, 22.5], [34.0, 22.5], [36.5, 18], [36, 14], [32, 14], [29.5, 17]]] },
      { id: 'aksum', name: 'Kingdom of Aksum', color: C.aksum, note: 'Rising Red Sea trading power in Ethiopia; King Ezana will convert to Christianity c. 340.', rings: [AKSUM_RING] },
      { id: 'garamantes', name: 'Garamantes', color: C.garamantes, note: 'Saharan kingdom of the Fezzan.', rings: [GARAMANTES_RING] },
    ],

    // ------------------------------------------------------------------ 500 CE
    '500ad': [
      { id: 'lazica', name: 'Lazica (Roman ally)', color: C.romeClient, note: 'Christian kingdom of western Georgia, allied to Constantinople.', rings: [[[41.5, 41.5], [41.6, 43.3], [43.5, 43.0], [43.5, 42.3], [42.5, 41.5]]] },
      { id: 'bosporus', name: 'Bosporus (Roman ally)', color: C.bosporus, note: 'Greek city-state of the Kerch strait among the steppe peoples.', rings: [[[35.0, 44.8], [38.0, 44.8], [38.0, 45.6], [35.0, 45.6]]] },
      { id: 'ghassanids', name: 'Ghassanid Arabs (Roman allies)', color: C.arabs, note: 'Christian Arab federates guarding Rome\'s desert frontier (formal alliance c. 502).', rings: [GHASSANID_RING] },
      {
        id: 'rome', name: 'Eastern Roman Empire', color: C.rome,
        note: 'Emperor Anastasius I rules from Constantinople, from the Danube to Egypt and Libya.',
        rings: [
          [
            [19.3, 44.9], [20.3, 45.0], [22.5, 44.7], [24.0, 43.8], [26.0, 43.75], [28.0, 44.1], [29.7, 45.3], [30.5, 44.5],
            [31, 43], [36, 42.4], [40, 41.7], [41.6, 41.6], [41.6, 41.0], [42.0, 40.3], [41.8, 39.5], [41.8, 38.8], [41.4, 38.2],
            [41.0, 37.3], [40.8, 36.6], [40.6, 35.8], [40.8, 35.0], [40.5, 34.5], [39.0, 33.5], [38.0, 32.0], [38.5, 30.0],
            [37.5, 28.5], [36, 27.5], [35.5, 24.0], [32.9, 23.95], [30, 24], [28, 25.5], [25.5, 29.5], [22, 29.8], [20, 30.5],
            [19.5, 30.5], [19.5, 34.0], [19.0, 37.0], [18.8, 40.2], [18.9, 41.5], [18.6, 42.3], [19.2, 43.0], [19.3, 44.0],
          ],
          [[32.8, 44.3], [34.6, 44.3], [34.6, 44.9], [32.8, 44.9]],
        ],
      },
      {
        id: 'vandals', name: 'Vandal Kingdom', color: C.vandal,
        note: 'King Thrasamund rules Africa, Sardinia, Corsica and the Balearics from Carthage.',
        rings: [
          [[2.0, 37.0], [11.5, 37.6], [11.5, 35.5], [10.8, 34.0], [11.5, 33.0], [15.0, 33.5], [19.5, 31.5], [19.5, 30.0], [15.0, 31.0], [13.0, 31.8], [10.5, 33.0], [9.0, 34.3], [7.0, 35.8], [5.0, 36.0], [2.0, 36.2]],
          [[8.0, 38.8], [10.0, 38.8], [10.0, 43.1], [8.4, 43.1], [8.0, 41.0]],
          [[1.0, 38.5], [4.5, 38.5], [4.5, 40.2], [1.0, 40.2]],
          [[12.2, 37.6], [12.75, 37.6], [12.75, 38.05], [12.2, 38.05]],
        ],
      },
      {
        id: 'ostrogoths', name: 'Ostrogothic Kingdom', color: C.ostrogoth,
        note: 'Theoderic the Great rules Italy, Sicily and Dalmatia from Ravenna, nominally on behalf of the emperor.',
        rings: [[
          [7.0, 43.75], [7.0, 44.5], [6.9, 45.6], [7.0, 46.0], [8.5, 46.5], [9.5, 47.3], [10.5, 47.7], [12.5, 47.8], [14, 47.5],
          [16.0, 46.8], [17.0, 46.0], [17.5, 45.5], [18.6, 45.1], [19.3, 44.9], [19.3, 44.0], [19.2, 43.0], [18.6, 42.3],
          [18.9, 41.5], [18.8, 40.2], [17.0, 37.0], [15.5, 36.3], [12.8, 36.3], [12.0, 37.5], [12.0, 38.5], [11.5, 40.0],
          [10.5, 41.5], [10.0, 43.0], [7.5, 43.6],
        ]],
      },
      {
        id: 'gepids', name: 'Gepids', color: C.gepid,
        note: 'Germanic kingdom on the Tisza, holding Sirmium in 500.',
        rings: [[[18.6, 45.1], [19.3, 44.9], [20.3, 45.0], [22.5, 44.7], [23.0, 45.5], [25.5, 46.0], [25.0, 47.8], [22.0, 48.2], [20.0, 47.5], [18.5, 47.9], [18.5, 46.0]]],
      },
      { id: 'suevi', name: 'Suevic Kingdom', color: C.suevi, note: 'Germanic kingdom in Gallaecia.', rings: [SUEVI_RING] },
      {
        id: 'burgundians', name: 'Burgundian Kingdom', color: C.burgundian,
        note: 'King Gundobad rules the Rhône and Saône valleys from Lyon and Geneva.',
        rings: [[[4.0, 47.8], [6.0, 48.0], [7.5, 47.6], [8.2, 46.8], [7.8, 46.0], [7.0, 45.6], [6.9, 45.6], [7.0, 44.5], [6.6, 44.2], [5.5, 44.0], [4.9, 43.95], [4.6, 44.3], [4.0, 45.2], [3.8, 45.8], [3.6, 46.6], [3.8, 47.4]]],
      },
      {
        id: 'visigoths', name: 'Visigothic Kingdom', color: C.visigoth,
        note: 'Alaric II rules from Toulouse over Aquitaine, Provence and most of Spain, until Clovis defeats him in 507.',
        rings: [[
          [-10, 36.5], [-6.0, 35.9], [-2.0, 36.4], [0.5, 37.5], [1.0, 40.5], [3.5, 42.1], [4.0, 43.0], [5.5, 42.9], [6.5, 43.05],
          [7.0, 43.7], [6.6, 44.2], [5.5, 44.0], [4.9, 43.95], [4.6, 44.3], [4.0, 45.2], [3.8, 45.8], [3.0, 46.4], [2.2, 47.1],
          [1.0, 47.45], [0.0, 47.3], [-1.5, 47.2], [-2.6, 47.2], [-5, 47.0], [-5, 44.0], [-10, 44.0],
        ]],
      },
      {
        id: 'franks', name: 'Frankish kingdoms (Clovis)', color: C.frank,
        note: 'Clovis rules northern Gaul from Soissons and Paris; Rhineland Franks rule from Cologne.',
        rings: [[[-2.0, 47.0], [3.5, 46.3], [4.0, 47.8], [6.0, 48.0], [7.5, 47.6], [8.5, 48.5], [9.0, 50.5], [9.5, 52.5], [6.5, 53.5], [2.5, 51.5], [-1.5, 50.0], [-2.0, 48.7]]],
      },
      { id: 'lakhmids', name: 'Lakhmid Arabs (Persian allies)', color: C.persiaClient, note: 'Arab kingdom of al-Hira, guarding Persia\'s desert flank.', rings: [LAKHMID_RING] },
      { id: 'sasanian', name: 'Sasanian Empire', color: C.persia, note: 'King Kavad I rules from Ctesiphon; war with Rome will break out in 502.', rings: [SASANIAN_RING] },
      { id: 'nubia', name: 'Nubian kingdoms', color: C.nubia, note: 'Nobadia, Makuria and Alodia, successors of Kush, still pagan.', rings: [NUBIA_RING] },
      { id: 'aksum', name: 'Kingdom of Aksum', color: C.aksum, note: 'Christian Red Sea trading kingdom.', rings: [AKSUM_RING] },
      { id: 'garamantes', name: 'Garamantes', color: C.garamantes, note: 'Saharan kingdom of the Fezzan.', rings: [GARAMANTES_RING] },
      {
        id: 'moors', name: 'Moorish kingdoms', color: C.moor,
        note: 'Berber kingdoms in Mauretania and the Aurès, independent of the Vandals.',
        rings: [[[-10, 36.0], [-5.7, 36.0], [0, 36.3], [2.0, 36.2], [5.0, 36.0], [7.0, 35.8], [9.0, 34.3], [10.5, 33.0], [9.0, 31.0], [0, 32], [-10, 29]]],
      },
    ],

    // ------------------------------------------------------------------ 565 CE
    '565ce': [
      { id: 'ghassanids', name: 'Ghassanid Arabs (Roman allies)', color: C.arabs, note: 'Christian Arab federates under the phylarch al-Harith ibn Jabala.', rings: [GHASSANID_RING] },
      {
        id: 'rome', name: 'Eastern Roman Empire (Justinian)', color: C.rome,
        note: 'At its widest after Justinian\'s reconquests: Italy, Africa, Sicily, Sardinia, Dalmatia and southern Spain have been added to the East.',
        rings: [
          [
            [7.0, 43.75], [7.0, 44.5], [6.9, 45.6], [7.0, 46.0], [8.5, 46.5], [10.0, 46.6], [12.5, 46.7], [14.0, 46.4],
            [15.5, 46.3], [16.5, 45.8], [17.5, 45.3], [19.0, 45.0], [19.3, 44.9], [20.3, 45.0], [22.5, 44.7], [24.0, 43.8],
            [26.0, 43.75], [28.0, 44.1], [29.7, 45.3], [30.5, 44.5], [31, 43], [36, 42.4], [40, 41.7], [41.5, 41.6],
            [41.6, 43.3], [43.5, 43.0], [43.5, 42.3], [42.5, 41.5], [42.0, 40.3], [41.8, 39.5], [41.8, 38.8], [41.4, 38.2],
            [41.0, 37.3], [40.8, 36.6], [40.6, 35.8], [40.8, 35.0], [40.5, 34.5], [39.0, 33.5], [38.0, 32.0], [38.5, 30.0],
            [37.5, 28.5], [36, 27.5], [35.5, 24.0], [32.9, 23.95], [30, 24], [28, 25.5], [25.5, 29.5], [22, 29.8], [19, 30.2],
            [16, 30.5], [13, 31.0], [11, 31.5], [10, 32.8], [9.5, 33.5], [8.5, 34.3], [7.5, 35.2], [6.5, 35.8], [5.0, 36.2],
            [3.0, 36.4], [1.8, 36.4], [1.5, 37.0], [0.5, 38.3], [0.8, 40.3], [4.8, 40.3], [7.5, 43.2], [7.5, 43.5],
          ],
          [[-5.7, 35.9], [-0.5, 37.4], [-0.6, 37.9], [-2.5, 37.6], [-4.5, 37.0], [-5.6, 36.6]],
          [[32.8, 44.3], [37.0, 44.3], [37.0, 45.6], [35.0, 45.6], [32.8, 44.9]],
        ],
      },
      {
        id: 'lombards', name: 'Lombards', color: C.lombard,
        note: 'Germanic people settled in Pannonia as Roman allies; they will invade Italy in 568.',
        rings: [[[15.5, 48.3], [17.0, 48.2], [19.3, 47.9], [19.3, 47.0], [18.8, 46.0], [17.5, 45.5], [16.5, 45.8], [15.5, 46.3], [14.5, 47.0]]],
      },
      {
        id: 'gepids', name: 'Gepids', color: C.gepid,
        note: 'Their kingdom, centred on Sirmium, will be destroyed by the Lombards and Avars in 567.',
        rings: [[[18.8, 46.0], [19.3, 47.0], [20, 47.5], [22, 48.2], [25.0, 47.8], [25.5, 46.0], [23.0, 45.5], [22.5, 44.7], [20.3, 45.0], [19.3, 44.9], [19.0, 45.0], [18.8, 45.5]]],
      },
      { id: 'suevi', name: 'Suevic Kingdom', color: C.suevi, note: 'Catholic since c. 560 under King Theodemir; conquered by the Visigoths in 585.', rings: [SUEVI_RING] },
      {
        id: 'visigoths', name: 'Visigothic Kingdom', color: C.visigoth,
        note: 'King Athanagild rules Spain from Toledo, plus Septimania (around Narbonne) in Gaul.',
        rings: [[
          [-10, 36.5], [-6.0, 35.9], [-2.0, 36.4], [0.5, 37.5], [1.0, 40.5], [3.3, 41.9], [3.2, 42.4], [3.5, 43.0], [4.55, 43.6],
          [4.55, 43.95], [3.8, 44.2], [2.5, 43.7], [1.9, 43.1], [1.0, 42.6], [-1.5, 43.0], [-1.8, 43.4], [-5, 43.8], [-10, 44.0],
        ]],
      },
      {
        id: 'franks', name: 'Frankish kingdoms', color: C.frank,
        note: 'Gaul divided among the four sons of Chlothar I: Charibert (Paris), Guntram (Orléans and Burgundy), Sigibert (Metz) and Chilperic (Soissons).',
        rings: [[
          [-2.0, 47.0], [-1.5, 46.0], [-1.4, 44.0], [-1.8, 43.4], [-1.5, 43.0], [1.0, 42.6], [1.9, 43.1], [2.5, 43.7], [3.8, 44.2],
          [4.55, 43.95], [4.55, 43.6], [4.6, 43.3], [6.5, 43.0], [7.0, 43.75], [7.0, 44.5], [6.9, 45.6], [7.0, 46.0], [8.5, 46.5],
          [10.0, 46.6], [12.5, 46.7], [13.5, 47.5], [13.0, 49.0], [12.0, 50.5], [11.5, 52.0], [9.5, 53.5], [6.5, 53.5], [2.5, 51.5],
          [-1.5, 50.0], [-2.0, 48.7],
        ]],
      },
      { id: 'lakhmids', name: 'Lakhmid Arabs (Persian allies)', color: C.persiaClient, note: 'Arab kingdom of al-Hira, Persia\'s desert allies.', rings: [LAKHMID_RING] },
      { id: 'sasanian', name: 'Sasanian Empire', color: C.persia, note: 'Khosrow I Anushirvan, at peace with Rome since the Fifty-Year Peace of 562.', rings: [SASANIAN_RING] },
      { id: 'nubia', name: 'Nubian kingdoms', color: C.nubia, note: 'Nobadia (Christian since 543), Makuria and Alodia.', rings: [NUBIA_RING] },
      { id: 'aksum', name: 'Kingdom of Aksum', color: C.aksum, note: 'Christian kingdom that has recently ruled over Yemen.', rings: [AKSUM_RING] },
      { id: 'garamantes', name: 'Garamantes', color: C.garamantes, note: 'Will accept Christianity c. 569.', rings: [GARAMANTES_RING] },
      {
        id: 'moors', name: 'Moorish kingdoms', color: C.moor,
        note: 'Berber kingdoms of Mauretania and the Aurès, often at war with Roman Africa.',
        rings: [[[-10, 36.0], [-5.7, 36.0], [0, 36.3], [2.0, 36.2], [5.0, 36.0], [7.0, 35.8], [9.0, 34.3], [10.5, 33.0], [9.0, 31.0], [0, 32], [-10, 29]]],
      },
    ],
  },
};
