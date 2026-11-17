window.AWT = window.AWT || {};

AWT.periods = [
  {
    id: '500bc',
    label: '500 BC',
    title: 'The Persian Empire & the Greek world',
    summary:
      'Darius I rules the Achaemenid Empire from the Aegean to the Indus, linked by the Royal Road. ' +
      'Greek and Phoenician city-states have colonised the Mediterranean and Black Sea coasts, Carthage ' +
      'dominates the western seas, and Rome is a young republic (traditionally founded 509 BC). ' +
      'The Ionian Revolt against Persia is about to break out (499 BC).',
  },
  {
    id: '0ce',
    label: '0 CE',
    title: 'The Roman Empire under Augustus',
    summary:
      'Around the turn of the era (there is no year zero — 1 BC is followed by AD 1) Augustus rules a ' +
      'Mediterranean that is, for the first time, under a single power. Roman roads and the grain fleets ' +
      'tie the provinces to Rome; Parthia rules Mesopotamia and Iran, and Nabataean caravans bring incense ' +
      'from Arabia to Gaza.',
  },
  {
    id: '500ad',
    label: '500 CE',
    title: 'Successor kingdoms & the Eastern Roman Empire',
    summary:
      'The western empire has given way to Germanic kingdoms: Theoderic the Ostrogoth rules Italy from ' +
      'Ravenna, the Vandals hold Carthage, the Visigoths Toulouse and Spain. Emperor Anastasius I governs ' +
      'the East from Constantinople, fed by the Egyptian grain fleet, while the Sasanian Persians rule from ' +
      'Ctesiphon. Pilgrims travel the roads to Jerusalem.',
  },
];

/* Approximate political labels drawn on the map for each period. */
AWT.regionLabels = {
  '500bc': [
    { text: 'Achaemenid Persian Empire', lat: 36.2, lng: 42.0, size: 'lg' },
    { text: 'Hellas', lat: 38.9, lng: 22.0 },
    { text: 'Magna Graecia', lat: 39.4, lng: 16.4 },
    { text: 'Etruria', lat: 43.0, lng: 11.6 },
    { text: 'Carthaginian sphere', lat: 34.6, lng: 8.0 },
    { text: 'Egypt (Persian satrapy)', lat: 27.5, lng: 31.0 },
    { text: 'Scythians', lat: 47.6, lng: 34.0 },
    { text: 'Iberians & Celts', lat: 40.0, lng: -4.0 },
    { text: 'Celts', lat: 46.8, lng: 3.0 },
    { text: 'Thrace', lat: 42.2, lng: 25.2 },
    { text: 'Libyan peoples', lat: 29.5, lng: 18.0 },
    { text: 'Kush', lat: 19.5, lng: 32.0 },
    { text: 'Illyrians', lat: 43.6, lng: 18.4 },
  ],
  '0ce': [
    { text: 'Roman Empire', lat: 44.3, lng: 19.5, size: 'lg' },
    { text: 'Parthian Empire', lat: 34.8, lng: 46.0, size: 'lg' },
    { text: 'Egypt (Roman province)', lat: 27.5, lng: 31.0 },
    { text: 'Nabataean Kingdom', lat: 29.6, lng: 36.8 },
    { text: 'Judaea', lat: 31.2, lng: 35.3 },
    { text: 'Mauretania (client kingdom)', lat: 34.3, lng: -2.5 },
    { text: 'Bosporan Kingdom', lat: 45.6, lng: 37.6 },
    { text: 'Gallia', lat: 46.6, lng: 2.5 },
    { text: 'Hispania', lat: 40.0, lng: -4.0 },
    { text: 'Germania', lat: 50.5, lng: 10.0 },
    { text: 'Garamantes', lat: 27.6, lng: 14.5 },
    { text: 'Kingdom of Kush', lat: 19.5, lng: 32.0 },
    { text: 'Armenia', lat: 40.6, lng: 42.6 },
    { text: 'Pannonia (being conquered)', lat: 46.4, lng: 17.6 },
    { text: 'Dacians', lat: 46.0, lng: 24.5 },
  ],
  '500ad': [
    { text: 'Eastern Roman Empire', lat: 39.2, lng: 33.0, size: 'lg' },
    { text: 'Sasanian Empire', lat: 34.6, lng: 46.5, size: 'lg' },
    { text: 'Ostrogothic Kingdom', lat: 43.4, lng: 12.6 },
    { text: 'Visigothic Kingdom', lat: 41.0, lng: -3.5 },
    { text: 'Vandal Kingdom', lat: 34.9, lng: 8.8 },
    { text: 'Burgundians', lat: 46.4, lng: 5.4 },
    { text: 'Franks (Clovis)', lat: 48.8, lng: 2.5 },
    { text: 'Moorish kingdoms', lat: 33.8, lng: -3.5 },
    { text: 'Ghassanids', lat: 32.3, lng: 37.5 },
    { text: 'Lakhmids', lat: 31.3, lng: 43.6 },
    { text: 'Gepids', lat: 46.6, lng: 21.0 },
    { text: 'Persarmenia', lat: 39.6, lng: 45.4 },
    { text: 'Lazica', lat: 42.6, lng: 42.6 },
    { text: 'Nubian kingdoms', lat: 20.0, lng: 32.0 },
  ],
};

/*
 * Travel assumptions used to turn distances into days. These are deliberately
 * round numbers drawn from typical figures in the ancient sources and modern
 * studies (e.g. Casson, "Travel in the Ancient World"; the Stanford ORBIS model).
 */
AWT.travelers = {
  ordinary: {
    label: 'Ordinary traveller',
    help: 'Walking or by mule (~30 km/day), passage on a merchant ship (~120 km/day including waits), riverboats.',
    speeds: { road: 30, sea: 120, riverDown: 70, riverUp: 25 },
  },
  courier: {
    label: 'Official courier',
    help: 'Relays of horses on state roads (Persian angarium, Roman cursus publicus) ~75 km/day; fast ships ~150 km/day.',
    speeds: { road: 75, sea: 150, riverDown: 90, riverUp: 35 },
  },
};

/* Factor applied to the straight-line distance between waypoints to approximate real winding paths. */
AWT.windingFactor = { road: 1.15, sea: 1.05, river: 1.2 };
