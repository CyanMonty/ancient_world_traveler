window.AWT = window.AWT || {};

/*
 * Routes (graph edges). Every route is attested by, or reconstructed from,
 * ancient accounts. Fields:
 *   from, to    city ids
 *   mode        'road' | 'sea' | 'river'
 *   periods     which periods the route is available in
 *   via         waypoint names (see waypoints.js) used to draw the route
 *   name, desc, sources
 *   downwind    (sea) city that ships sail TOWARD with the prevailing summer wind;
 *               the opposite direction is much slower
 *   downstream  (river) the downstream end
 *   crossing    short sea crossing that was attempted even in winter
 *   byPeriod    per-period overrides of name / desc / sources
 */
(function () {
  const routes = [];
  const ALL = ['500bc', '0ce', '500ad'];
  const ROMAN = ['0ce', '500ad'];
  function R(from, to, mode, periods, info) {
    routes.push(Object.assign({ id: `${from}-${to}-${mode}`, from, to, mode, periods, via: [] }, info));
  }

  // ===================================================================== SEA — EAST
  R('tyre', 'sidon', 'sea', ['500bc'], {
    name: 'Phoenician coastal run',
    desc: 'The twin capitals of Phoenicia were a day\'s sail apart. Ezekiel\'s lament for Tyre (ch. 27, 6th century BC) pictures the city as a great ship, trading with Tarshish, Cyprus, Egypt and Greece.',
    sources: ['Ezekiel 27', 'Herodotus 7.96–98 (Phoenician fleet of Xerxes)'],
  });
  R('sidon', 'salamis', 'sea', ALL, {
    name: 'Phoenicia – Cyprus crossing',
    via: [],
    desc: 'Cyprus, visible from the Lebanon mountains on clear days, was the first stepping stone westward. Phoenicians settled at Kition; Cypriot copper and timber came back.',
    sources: ['Herodotus 5.104–108 (Cyprus in the Ionian Revolt)', 'Acts 13:4 (Paul and Barnabas sail to Salamis)'],
  });
  R('tyre', 'joppa', 'sea', ['500bc'], {
    name: 'Phoenician coast to Joppa',
    desc: 'The returning exiles paid Sidonians and Tyrians "to bring cedar trees from Lebanon to the sea, to Joppa" for the Second Temple.',
    sources: ['Ezra 3:7'],
  });
  R('joppa', 'gaza', 'sea', ['500bc'], {
    name: 'Philistine coastal run',
    desc: 'Short coastal hops along the harbourless coast of Palestine.',
    sources: ['Periplus of Pseudo-Scylax §104 (Syrian coast)'],
  });
  R('salamis', 'lindos', 'sea', ['500bc'], {
    name: 'Cyprus – Rhodes run',
    via: ['cyprus_w'],
    desc: 'The main sea lane from the Levant to the Aegean ran along southern Anatolia and Rhodes.',
    sources: ['Herodotus 2.178 (Rhodians at Naukratis)', 'Herodotus 7.90 (Cypriot ships)'],
  });
  R('lindos', 'naukratis', 'sea', ['500bc'], {
    name: 'Greek trade to Egypt',
    via: ['canopic_mouth'],
    desc: 'Greek merchant ships had to enter Egypt by the Canopic mouth of the Nile and trade at Naukratis; a ship arriving at any other mouth had to swear it came by accident and sail round. Lindos was one of the founders of the Hellenion there.',
    sources: ['Herodotus 2.178–179'],
    downwind: 'naukratis',
  });
  R('lindos', 'miletus', 'sea', ['500bc'], {
    name: 'Ionian–Dorian coast',
    via: [],
    desc: 'Coastal sailing past Halicarnassus and Cnidus linking the East Greek cities.',
    sources: ['Herodotus 1.142–144'],
  });
  R('lindos', 'gortyn', 'sea', ['500bc'], {
    name: 'Rhodes – Crete crossing',
    via: ['karpathos_n', 'crete_e', 'crete_se'],
    desc: 'Island-hopping via Karpathos to eastern Crete, part of the old route from the Levant to the west along Crete\'s southern shore.',
    sources: ['Homer, Odyssey 14.252–258 (Crete to Egypt in five days)'],
  });
  R('gortyn', 'carthage', 'sea', ['500bc'], {
    name: 'Phoenician trunk route west',
    via: ['malta', 'sicily_channel', 'carthage_gulf'],
    desc: 'Phoenician ships linking Tyre with its western colonies ran along Crete and through Phoenician Malta (Melite) to Carthage. Carthage still sent yearly offerings to Melqart at Tyre.',
    sources: ['Diodorus 20.14 (tithes to Tyre)', 'Diodorus 5.12 (Phoenician Melite)'],
  });
  R('cyrene', 'gortyn', 'sea', ['500bc', '0ce', '500ad'], {
    name: 'Crete – Libya crossing',
    desc: 'The founders of Cyrene were guided by Corobius, a Cretan purple-fisher from Itanos who knew the way to Libya. Under Rome, Crete and Cyrene formed a single province.',
    sources: ['Herodotus 4.151', 'Strabo 10.4.5 (Crete to Cyrenaica)'],
    byPeriod: {
      '0ce': { name: 'Provincial crossing (Crete & Cyrenaica)' },
    },
  });
  R('cyrene', 'naukratis', 'sea', ['500bc'], {
    name: 'Libyan coast to Egypt',
    via: ['libya_off2', 'libya_off1', 'canopic_mouth'],
    desc: 'Cyrene was closely tied to Saite Egypt: Pharaoh Amasis married the Cyrenaean Ladice.',
    sources: ['Herodotus 2.181', 'Herodotus 4.159'],
  });
  R('tarsus', 'salamis', 'sea', ALL, {
    name: 'Cilicia – Cyprus crossing',
    desc: 'A short crossing between the Cilician plain and northern Cyprus.',
    sources: ['Herodotus 5.108 (Persian army ferried from Cilicia to Cyprus)'],
  });

  // ===================================================================== SEA — AEGEAN & BLACK SEA
  R('athens', 'byzantium', 'sea', ALL, {
    name: 'Hellespont route',
    via: ['saronic', 'sounion', 'kafireas', 'euboea_e', 'skyros_e', 'lemnos_s', 'tenedos', 'hellespont_s', 'hellespont_m', 'gallipoli', 'marmara'],
    desc: 'The sea road from Attica up the Aegean, through the Hellespont and Propontis to the Bosporus — the lifeline that would bring Black Sea grain to Athens. The current through the straits runs south, making the northbound passage slow.',
    sources: ['Herodotus 7.147 (grain ships sailing through the Hellespont)', 'Demosthenes 20.31 (Pontic grain)'],
    downwind: 'athens',
  });
  R('athens', 'miletus', 'sea', ['500bc'], {
    name: 'Across the Cyclades',
    via: ['saronic', 'sounion', 'kea_s', 'delos_s', 'samos_s'],
    desc: 'Island-hopping through the Cyclades past sacred Delos. In 498 BC twenty Athenian ships sailed to Ionia to support the revolt against Persia.',
    sources: ['Herodotus 5.97–99'],
  });
  R('ephesus', 'miletus', 'sea', ['500bc', '0ce'], {
    name: 'Ionian coast',
    desc: 'Short coastal sail along Ionia. St Paul, hurrying to Jerusalem, sailed past Ephesus and called the elders to meet him at Miletus.',
    sources: ['Acts 20:15–17', 'Herodotus 1.142'],
  });
  R('corinth', 'ephesus', 'sea', ROMAN, {
    name: 'Cenchreae – Ephesus crossing',
    via: ['saronic', 'sounion', 'tinos_s', 'ikaria_e', 'ephesus_off'],
    desc: 'From Corinth\'s eastern harbour of Cenchreae across the Aegean to the capital of Asia. Priscilla, Aquila and Paul made this crossing.',
    sources: ['Acts 18:18–19'],
  });
  R('byzantium', 'sinope', 'sea', ALL, {
    name: 'South Pontic coast',
    via: ['bosporus_s', 'bosporus_n', 'pontus_s'],
    desc: 'Greek ships hugged the Anatolian shore of the "Hospitable Sea" (Euxine). Herodotus measured the Black Sea in days of sailing.',
    sources: ['Herodotus 4.85–86', 'Arrian, Periplus of the Euxine Sea (AD 130s)'],
    downwind: 'sinope',
  });
  R('sinope', 'trapezus', 'sea', ALL, {
    name: 'East Pontic coast',
    via: ['samsun_off', 'yasun_off'],
    desc: 'Coastal run to Trapezus; Xenophon\'s Ten Thousand sailed back west along this coast in 400 BC.',
    sources: ['Xenophon, Anabasis 5–6', 'Arrian, Periplus 1–16'],
  });
  R('sinope', 'panticapaeum', 'sea', ALL, {
    name: 'Across the Black Sea',
    via: ['crimea_s', 'kerch_s'],
    desc: 'The Black Sea is narrowest between Cape Carambis and the Ram\'s Head (Criumetopon) in Crimea; Strabo says sailors in mid-crossing could see both headlands, dividing the Pontus into two seas.',
    sources: ['Strabo 2.5.22, 7.4.3'],
  });
  R('byzantium', 'olbia', 'sea', ['500bc', '0ce'], {
    name: 'West Pontic coast',
    via: ['bosporus_s', 'bosporus_n', 'pontus_w', 'pontus_nw', 'dnieper_bay', 'olbia_estuary'],
    desc: 'Along the Thracian shore past the Danube mouths to the Borysthenes (Dnieper). Herodotus describes the Scythian trade around Olbia ("the market of the Borysthenites").',
    sources: ['Herodotus 4.17–18, 4.53', 'Dio Chrysostom, Oration 36 (Olbia in the 1st century AD)'],
  });
  R('olbia', 'panticapaeum', 'sea', ['500bc'], {
    name: 'Around the Tauric Chersonese',
    via: ['olbia_estuary', 'dnieper_bay', 'crimea_s', 'kerch_s'],
    desc: 'Around the Crimean peninsula, whose southern mountain coast was home to the Tauri, notorious for sacrificing shipwrecked sailors.',
    sources: ['Herodotus 4.99–103'],
  });

  // ===================================================================== SEA — CENTRAL & WEST (500 BC)
  R('corinth', 'corcyra', 'sea', ALL, {
    name: 'Gulf of Corinth route',
    via: ['lechaion', 'corinth_gulf', 'patras_gulf', 'ithaca_e', 'lefkada_w', 'corfu_s'],
    desc: 'From Lechaion along the Gulf of Corinth avoids the dangerous rounding of Cape Malea ("when you round Malea, forget your home"). Ships could even be dragged across the Isthmus on the stone "diolkos".',
    sources: ['Strabo 8.6.20', 'Thucydides 1.13, 3.15 (diolkos)'],
  });
  R('corcyra', 'taras', 'sea', ALL, {
    name: 'Ionian Sea crossing to Italy',
    via: ['otranto', 'leuca_off'],
    desc: 'The standard crossing between Greece and Italy, from Corcyra to the Iapygian promontory. The great Athenian armada mustered at Corcyra in 415 BC for this crossing.',
    sources: ['Thucydides 1.36, 1.44, 6.30–44'],
  });
  R('corcyra', 'dyrrachium', 'sea', ALL, {
    name: 'Illyrian coast',
    desc: 'Epidamnus was a colony of Corcyra; a quarrel over it in 435 BC set off the chain of events leading to the Peloponnesian War.',
    sources: ['Thucydides 1.24–26'],
  });
  R('athens', 'corcyra', 'sea', ['500bc'], {
    name: 'Round Cape Malea',
    via: ['saronic', 'sounion', 'malea', 'kythera_s', 'matapan', 'ionian_e', 'ithaca_e', 'lefkada_w', 'corfu_s'],
    desc: 'The long way around the Peloponnese, past the storm-swept capes of Malea and Taenarum.',
    sources: ['Homer, Odyssey 9.80 (Odysseus blown off course at Malea)', 'Strabo 8.6.20'],
  });
  R('sparta', 'gortyn', 'sea', ['500bc'], {
    name: 'Laconia – Crete',
    via: ['malea', 'crete_n'],
    desc: 'From Sparta\'s port of Gytheion past Kythera to Crete. The Spartans believed their laws came from Crete.',
    sources: ['Herodotus 1.65', 'Strabo 10.4.17'],
  });
  R('rhegion', 'taras', 'sea', ALL, {
    name: 'Coast of Magna Graecia',
    via: ['spartivento_cal', 'colonna_off'],
    desc: 'Along the toe and instep of Italy past Locri, Croton and Sybaris.',
    sources: ['Thucydides 6.44', 'Strabo 6.1'],
  });
  R('rhegion', 'syracuse', 'sea', ALL, {
    name: 'Strait of Messina',
    via: ['messina'],
    desc: 'Passage through the strait guarded, in myth, by Scylla and Charybdis.',
    sources: ['Homer, Odyssey 12', 'Thucydides 4.24', 'Acts 28:12–13'],
    crossing: true,
  });
  R('kyme', 'rhegion', 'sea', ['500bc'], {
    name: 'Tyrrhenian coast',
    via: ['capri_s', 'stromboli_e', 'messina'],
    desc: 'The western coast of southern Italy, linking the Greek cities of Campania with Sicily.',
    sources: ['Strabo 5.4.4–9'],
  });
  R('syracuse', 'akragas', 'sea', ['500bc'], {
    name: 'South coast of Sicily',
    via: ['passero_off'],
    desc: 'Around Cape Pachynus and along Sicily\'s southern shore.',
    sources: ['Thucydides 6.2–5 (Sicilian colonies)'],
  });
  R('akragas', 'motya', 'sea', ['500bc'], {
    name: 'Into Punic Sicily',
    desc: 'West of Selinous lay the Phoenician sphere of the island.',
    sources: ['Thucydides 6.2'],
  });
  R('motya', 'carthage', 'sea', ['500bc'], {
    name: 'Sicilian Channel',
    via: ['carthage_gulf'],
    desc: 'The 150 km crossing that bound Carthage to its Sicilian outposts.',
    sources: ['Thucydides 6.2', 'Diodorus 14.47–53 (siege of Motya, 397 BC)'],
  });
  R('carthage', 'carales', 'sea', ALL, {
    name: 'Africa – Sardinia',
    via: ['carthage_gulf'],
    desc: 'Carthage controlled Sardinia from the late 6th century BC; under Rome and the Vandals the island stayed tied to Africa.',
    sources: ['Polybius 3.22–24 (treaties)', 'Procopius, Wars 3.10–11 (Vandal Sardinia)'],
  });
  R('carthage', 'caere', 'sea', ['500bc'], {
    name: 'Etruscan–Carthaginian alliance',
    via: ['carthage_gulf', 'sicily_w_off', 'tyrrh_c'],
    desc: 'Etruscans and Carthaginians had commercial treaties, and together fought the Phocaean Greeks at Alalia (c. 540 BC). The bilingual Pyrgi tablets come from Caere\'s port.',
    sources: ['Aristotle, Politics 3.9 (1280a)', 'Herodotus 1.166'],
  });
  R('carthage', 'gades', 'sea', ['500bc'], {
    name: 'Punic route to the Pillars',
    via: ['bizerte_off', 'bougaroun_off', 'algiers_off', 'oran_off', 'alboran', 'gibraltar'],
    desc: 'Carthage guarded this coastal route to Gadir and the Atlantic jealously: its first treaty with Rome (509 BC) barred Roman ships from sailing beyond the "Fair Promontory". Hanno and Himilco set out beyond the Pillars on voyages of exploration.',
    sources: ['Polybius 3.22', 'Periplus of Hanno', 'Strabo 17.1.19'],
  });
  R('massalia', 'emporion', 'sea', ['500bc'], {
    name: 'Phocaean coast',
    via: ['lion_gulf'],
    desc: 'Massalia\'s daughter colony Emporion was its window on Iberia.',
    sources: ['Strabo 3.4.8', 'Livy 34.9'],
  });
  R('emporion', 'gades', 'sea', ['500bc'], {
    name: 'Route to Tartessos',
    via: ['balearic_s', 'palos_off', 'cabo_gata', 'alboran', 'gibraltar'],
    desc: 'The Phocaeans were the first Greeks to make long voyages, reaching Tartessos in fifty-oared ships. By 500 BC Carthage was closing this route to Greeks.',
    sources: ['Herodotus 1.163', 'Herodotus 4.152 (Colaeus of Samos)'],
  });
  R('massalia', 'kyme', 'sea', ['500bc'], {
    name: 'Greek route through Bonifacio',
    via: ['cap_corse', 'tyrrh_n', 'tyrrh_e', 'capri_s'],
    desc: 'Greek merchants sailing between Massalia and the Campanian Greeks had to pass through waters contested with Etruscan and Carthaginian fleets.',
    sources: ['Herodotus 1.165–167 (Battle of Alalia)'],
  });

  // ===================================================================== SEA — ROMAN WEST
  R('gades', 'ostia', 'sea', ['0ce'], {
    name: 'Baetican trade route',
    via: ['gibraltar', 'alboran', 'cabo_gata', 'palos_off', 'balearic_s', 'sard_s', 'tyrrh_c'],
    desc: 'Big merchantmen carried oil, wine, fish sauce and metals from Turdetania to Ostia and Puteoli. Pliny records a record run from Ostia to Gades in seven days.',
    sources: ['Strabo 3.2.6', 'Pliny, Natural History 19.4'],
  });
  R('tarraco', 'ostia', 'sea', ['0ce'], {
    name: 'Tarraconensis – Ostia',
    via: ['menorca_n', 'asinara_w', 'bonifacio', 'tyrrh_e'],
    desc: 'Pliny cites a crossing from Ostia to Hither Spain (Tarraconensis) in just four days with a favourable wind.',
    sources: ['Pliny, Natural History 19.4'],
  });
  R('massalia', 'ostia', 'sea', ROMAN, {
    name: 'Gallic sea route',
    via: ['cap_corse', 'tyrrh_n'],
    desc: 'From the Gallic coast to Rome\'s harbour; Pliny notes a passage from Ostia to Narbonese Gaul in three days.',
    sources: ['Pliny, Natural History 19.4', 'Rutilius Namatianus, De Reditu Suo (AD 417, coasting from Rome to Gaul)'],
  });
  R('carthage', 'ostia', 'sea', ROMAN, {
    name: 'African grain route',
    via: ['carthage_gulf', 'sicily_w_off', 'tyrrh_c'],
    desc: 'Africa supplied much of Rome\'s grain. Pliny cites Ostia to Africa in two days. In 455 the Vandal fleet sailed this way to sack Rome.',
    sources: ['Pliny, Natural History 19.4', 'Procopius, Wars 3.5'],
    byPeriod: {
      '500ad': { name: 'Vandal–Italian sea route', desc: 'Trade and diplomacy between Vandal Carthage and Ostrogothic Italy continued along the old grain route; in 455 the Vandal fleet sailed it to sack Rome.' },
    },
  });
  R('carthage', 'lilybaeum', 'sea', ROMAN, {
    name: 'Sicilian Channel',
    via: ['carthage_gulf'],
    desc: 'Shortest crossing between Africa and Sicily.',
    sources: ['Strabo 6.2.1', 'Procopius, Wars 3.14 (Belisarius\'s fleet, 533)'],
  });
  R('carales', 'ostia', 'sea', ['0ce'], {
    name: 'Sardinian grain route',
    via: ['tyrrh_c'],
    desc: 'Sardinia was one of the "three granaries" of Rome along with Sicily and Africa.',
    sources: ['Cicero, De Imperio Cn. Pompei 34'],
  });
  R('ostia', 'puteoli', 'sea', ROMAN, {
    name: 'Campanian coast',
    via: ['capri_s'],
    desc: 'Coastal shipping between Rome\'s two harbours; cargoes from Alexandria landed at Puteoli were often forwarded to Ostia in smaller ships.',
    sources: ['Strabo 5.3.6', 'Suetonius, Claudius 20 (building of Portus)'],
  });
  R('rhegion', 'puteoli', 'sea', ROMAN, {
    name: 'Tyrrhenian coast',
    via: ['messina', 'stromboli_e', 'capri_s'],
    desc: '"A south wind sprang up, and on the second day we came to Puteoli" — St Paul\'s final leg by sea.',
    sources: ['Acts 28:13'],
  });
  R('caesarea_maur', 'carthage', 'sea', ROMAN, {
    name: 'African coast',
    via: ['saldae', 'hippo_regius', 'bizerte_off'],
    desc: 'Coastal shipping linked the harbour towns of Numidia and Mauretania, which had few good roads between them.',
    sources: ['Strabo 17.3.12–13', 'Itinerarium Maritimum'],
  });
  R('caesarea_maur', 'tingis', 'sea', ROMAN, {
    name: 'Mauretanian coast',
    via: ['oran_off', 'alboran'],
    desc: 'No Roman road linked the two Mauretanias; travel went by sea.',
    sources: ['Itinerarium Antonini (maritime section)', 'Pliny, Natural History 5.2'],
  });
  R('tingis', 'gades', 'sea', ROMAN, {
    name: 'Strait of Gibraltar',
    via: ['gibraltar'],
    desc: 'Crossing the Pillars of Hercules. In 429 the Vandals under Gaiseric crossed here from Spain into Africa.',
    sources: ['Strabo 3.1.7', 'Procopius, Wars 3.5'],
    crossing: true,
  });

  // ===================================================================== SEA — ROMAN EAST
  R('alexandria', 'puteoli', 'sea', ['0ce'], {
    name: 'Alexandrian grain fleet',
    via: ['alex_off', 'crete_s', 'ionian_open', 'spartivento_cal', 'messina', 'stromboli_e', 'capri_s'],
    desc: 'The great grain ships sailed from Italy to Egypt with the summer northerlies in as little as 9 days (Pliny), but the return against the wind could take one to two months, usually by way of Crete, Rhodes or Lycia. Caligula advised King Agrippa to take this direct route rather than going overland.',
    sources: ['Pliny, Natural History 19.3–4', 'Philo, In Flaccum 26', 'Seneca, Letters 77'],
    downwind: 'alexandria',
  });
  R('alexandria', 'myra', 'sea', ROMAN, {
    name: 'Grain-ship route via Lycia',
    via: ['alex_off', 'cyprus_w', 'gelidonya_s'],
    desc: 'Against the northerly winds, ships from Alexandria headed north to Lycia before turning west. At Myra Paul\'s escort found "a ship of Alexandria sailing for Italy".',
    sources: ['Acts 27:5–6', 'Lucian, The Ship (Navigium) 7–9'],
    downwind: 'alexandria',
  });
  R('alexandria', 'rhodes', 'sea', ROMAN, {
    name: 'Rhodes – Alexandria',
    via: ['alex_off'],
    desc: 'The busiest open-sea crossing of the Hellenistic world. Diodorus reckons four days from Rhodes to Alexandria.',
    sources: ['Diodorus 3.34.7'],
    downwind: 'alexandria',
  });
  R('byzantium', 'alexandria', 'sea', ['500ad'], {
    name: 'Egyptian grain fleet to Constantinople',
    via: ['marmara', 'gallipoli', 'hellespont_m', 'hellespont_s', 'lesbos_w', 'chios_w', 'ikaria_e', 'levitha', 'tilos_w', 'rhodes_s', 'alex_off'],
    desc: 'Since Constantine, Egypt\'s grain tax (the "embole") fed Constantinople. Fleets often waited at Tenedos for a wind to carry them up the Hellespont against the current, and Justinian later built a vast granary there.',
    sources: ['Procopius, Buildings 5.1', 'Justinian, Edict 13'],
    downwind: 'alexandria',
  });
  R('myra', 'rhodes', 'sea', ROMAN, {
    name: 'Lycian coast',
    via: ['lycia_w'],
    desc: 'Coastal hop westward from Lycia to Rhodes.',
    sources: ['Acts 21:1', 'Strabo 14.3'],
  });
  R('rhodes', 'ephesus', 'sea', ROMAN, {
    name: 'Asian coast',
    via: ['samos_s'],
    desc: 'Coasting by Cos and Samos.',
    sources: ['Acts 21:1', 'Strabo 14.1–2'],
  });
  R('myra', 'gortyn', 'sea', ROMAN, {
    name: 'Under the lee of Crete',
    via: ['lycia_w', 'karpathos_n', 'crete_e', 'crete_se', 'fair_havens'],
    desc: 'Paul\'s grain ship struggled past Cnidus, "sailed under the lee of Crete off Salmone" and reached Fair Havens near Lasea, close to Gortyna.',
    sources: ['Acts 27:7–8'],
  });
  R('gortyn', 'syracuse', 'sea', ROMAN, {
    name: 'Open sea via Malta',
    via: ['fair_havens', 'malta', 'passero_off'],
    desc: 'Leaving Crete late in the season, Paul\'s ship was driven by a north-easter for fourteen days and wrecked on Malta. After the winter they sailed on to Syracuse in "a ship of Alexandria".',
    sources: ['Acts 27:9–28:12'],
  });
  R('sidon', 'myra', 'sea', ROMAN, {
    name: 'North of Cyprus',
    via: ['cyprus_e', 'cyprus_n', 'antalya_gulf', 'gelidonya_s'],
    desc: '"Putting out to sea, we sailed under the lee of Cyprus because the winds were against us… and came to Myra in Lycia."',
    sources: ['Acts 27:4–5'],
  });
  R('caesarea', 'sidon', 'sea', ROMAN, {
    name: 'Levantine coast',
    desc: 'The first day of Paul\'s voyage to Rome.',
    sources: ['Acts 27:3'],
  });
  R('caesarea', 'alexandria', 'sea', ROMAN, {
    name: 'Caesarea – Alexandria',
    via: ['nile_off', 'alex_off'],
    desc: 'Herod\'s harbour at Caesarea was built to trade with Egypt and the West; later a route for Holy Land pilgrims.',
    sources: ['Josephus, Jewish War 1.408–415', 'Itinerarium of the Piacenza Pilgrim (c. 570)'],
    downwind: 'alexandria',
  });
  R('alexandria', 'cyrene', 'sea', ROMAN, {
    name: 'Libyan coast',
    via: ['libya_off1', 'libya_off2'],
    desc: 'Coastal shipping along the Marmarica to Cyrene\'s port of Apollonia.',
    sources: ['Strabo 17.3.20–22', 'Synesius of Cyrene, Letter 5 (a disastrous voyage, c. AD 404)'],
  });
  R('brundisium', 'dyrrachium', 'sea', ROMAN, {
    name: 'Adriatic crossing',
    desc: 'The standard crossing between Italy and the Balkans, about a day\'s sail. Caesar risked it in January 48 BC to surprise Pompey.',
    sources: ['Caesar, Civil War 3.6', 'Strabo 6.3.8'],
    crossing: true,
  });
  R('ravenna', 'brundisium', 'sea', ROMAN, {
    name: 'Adriatic coast',
    via: ['adriatic_n', 'adriatic_c', 'adriatic_s'],
    desc: 'Augustus based the Adriatic fleet at Classis, the port of Ravenna.',
    sources: ['Suetonius, Augustus 49', 'Cassiodorus, Variae 5.16–20 (Theoderic\'s fleet)'],
  });

  // ===================================================================== RIVERS
  R('memphis', 'naukratis', 'river', ['500bc'], {
    name: 'Canopic Nile',
    via: ['nile_delta'],
    desc: 'Down the Canopic branch of the Nile from the capital to the Greek emporium.',
    sources: ['Herodotus 2.97, 2.179'],
    downstream: 'naukratis',
  });
  R('pelusium', 'memphis', 'river', ['500bc'], {
    name: 'Pelusiac Nile',
    via: ['nile_delta'],
    desc: 'Up the easternmost branch of the Nile from the frontier fortress to Memphis, the route Cambyses\' army followed.',
    sources: ['Herodotus 2.17, 3.10–13'],
    downstream: 'pelusium',
  });
  R('alexandria', 'memphis', 'river', ['0ce'], {
    name: 'Nile & Canopic canal',
    via: ['canopus', 'nile_delta'],
    desc: 'A canal linked Alexandria with the Canopic Nile; Strabo sailed up the river to Memphis and beyond with the prefect Aelius Gallus.',
    sources: ['Strabo 17.1.16, 17.1.30–31'],
    downstream: 'alexandria',
  });
  R('rome', 'ostia', 'river', ROMAN, {
    name: 'Tiber',
    desc: 'Cargoes were transshipped at Ostia or Portus into barges hauled upstream by oxen to the river port of Rome; the Via Ostiensis ran alongside.',
    sources: ['Strabo 5.3.5', 'Procopius, Wars 5.26 (towing barges up the Tiber)'],
    downstream: 'ostia',
  });
  R('lugdunum', 'arelate', 'river', ROMAN, {
    name: 'Rhône',
    via: ['vienna_gal', 'valentia_gal', 'arausio'],
    desc: 'Goods went up the Rhône and Saône by boat, then overland to the Seine and the Ocean. The current is strong, so upstream travel was slow.',
    sources: ['Strabo 4.1.14'],
    downstream: 'arelate',
  });
  R('mediolanum', 'ravenna', 'river', ['500ad'], {
    name: 'Po (cursus publicus boats)',
    via: ['ticinum', 'cremona', 'hostilia', 'po_delta'],
    desc: 'Sidonius Apollinaris, travelling to Rome in 467, boarded a state boat at Ticinum and sailed down the Po to Ravenna, eating fish and complaining of mosquitoes.',
    sources: ['Sidonius Apollinaris, Letters 1.5'],
    downstream: 'ravenna',
  });
  R('corduba', 'hispalis', 'river', ROMAN, {
    name: 'Baetis (Guadalquivir)',
    via: ['astigi'],
    desc: 'Large ships sailed up to Hispalis, smaller ones to Ilipa, and river boats to Corduba.',
    sources: ['Strabo 3.2.3'],
    downstream: 'hispalis',
  });
  R('nisibis', 'ctesiphon', 'river', ['500ad'], {
    name: 'Tigris',
    via: ['mosul', 'assur'],
    desc: 'Down the Tigris valley from the frontier to the Sasanian capital.',
    sources: ['Ammianus Marcellinus 24–25 (Julian\'s campaign)', 'Codex Justinianus 4.63.4'],
    downstream: 'ctesiphon',
  });
  R('zeugma', 'ctesiphon', 'river', ['0ce'], {
    name: 'Euphrates (Parthian Stations)',
    via: ['callinicum', 'circesium', 'dura', 'hit'],
    desc: 'Isidore of Charax lists the stations along the Euphrates from the Zeugma crossing down to Seleucia on the Tigris, opposite Ctesiphon.',
    sources: ['Isidore of Charax, Parthian Stations 1'],
    downstream: 'ctesiphon',
  });

  // ===================================================================== ROADS — PERSIAN (500 BC)
  R('gordion', 'susa', 'road', ['500bc'], {
    name: 'Royal Road',
    via: ['halys', 'melitene', 'tigris_upper', 'arbela', 'zagros_foot'],
    desc: 'Darius\'s great road: 111 staging posts, 450 parasangs (13,500 stades), "90 days\' journey" at 150 stades a day. Royal messengers riding in relays were far faster — "neither snow nor rain nor heat nor gloom of night stays these couriers".',
    sources: ['Herodotus 5.52–54', 'Herodotus 8.98', 'Persepolis Fortification Tablets'],
  });
  R('sardis', 'gordion', 'road', ['500bc'], {
    name: 'Royal Road (western section)',
    desc: 'The first stretch of the Royal Road through Lydia and Phrygia.',
    sources: ['Herodotus 5.52'],
  });
  R('ephesus', 'sardis', 'road', ALL, {
    name: 'Ephesus – Sardis road',
    desc: 'Herodotus adds this 540-stade stretch — three days\' march — to the Royal Road to get the full distance from the sea to Susa.',
    sources: ['Herodotus 5.54', 'Herodotus 5.100 (Ionian army marches to Sardis, 498 BC)'],
    byPeriod: { '0ce': { name: 'Road of the Hermus valley' }, '500ad': { name: 'Road of the Hermus valley' } },
  });
  R('babylon', 'susa', 'road', ['500bc'], {
    name: 'Babylon – Susa road',
    via: [],
    desc: 'Royal road between the two capitals. Travellers carried sealed authorisations entitling them to rations at each way-station.',
    sources: ['Persepolis Fortification Tablets (travel rations, Q texts)', 'Herodotus 1.188'],
  });
  R('sardis', 'tarsus', 'road', ['500bc'], {
    name: 'Road of Cyrus the Younger',
    via: ['celaenae', 'iconium', 'tyana', 'cilician_gates'],
    desc: 'The road from Sardis across Phrygia and through the Cilician Gates to Tarsus. Cyrus the Younger led the Ten Thousand along it in 401 BC.',
    sources: ['Xenophon, Anabasis 1.2'],
  });
  R('tarsus', 'babylon', 'road', ['500bc'], {
    name: 'Through the Syrian Gates & down the Euphrates',
    via: ['issus', 'syrian_gates', 'aleppo', 'thapsacus', 'dura', 'hit'],
    desc: 'From Cilicia past Issus and the Syrian Gates, across to the Euphrates at Thapsacus, then down the river to Babylonia.',
    sources: ['Xenophon, Anabasis 1.4–1.8'],
  });
  R('damascus', 'babylon', 'road', ['500bc'], {
    name: 'Road of the Fertile Crescent',
    via: ['hamath', 'aleppo', 'thapsacus', 'dura', 'hit'],
    desc: 'The great arc from Syria up to the Euphrates and down to Babylon, avoiding the desert — the road the Judean exiles had walked.',
    sources: ['Ezra 7:8–9 (four months from Babylon to Jerusalem)', 'Xenophon, Anabasis 1.4'],
  });
  R('byzantium', 'sardis', 'road', ['500bc'], {
    name: 'Bosporus – Hellespontine Phrygia',
    via: ['daskyleion'],
    desc: 'From the Bosporus, where Darius had built a bridge of boats for his Scythian expedition (c. 513 BC), through the satrapy of Daskyleion to Sardis.',
    sources: ['Herodotus 4.83–88'],
  });

  // ===================================================================== ROADS — LEVANT & EGYPT
  R('gaza', 'pelusium', 'road', ALL, {
    name: 'Way of Horus / desert road to Egypt',
    via: ['raphia', 'rhinocorura'],
    desc: 'The only road into Egypt from Asia crosses three days of waterless desert; Cambyses had Arab allies supply water by camel.',
    sources: ['Herodotus 3.5–9'],
    byPeriod: {
      '0ce': { name: 'Coastal road to Egypt', sources: ['Herodotus 3.5–9', 'Strabo 16.2.31–33', 'Matthew 2:13–14 (Flight into Egypt)'] },
      '500ad': { name: 'Coastal road to Egypt', sources: ['Itinerarium Antonini', 'Itinerarium of the Piacenza Pilgrim (c. 570)'] },
    },
  });
  R('jerusalem', 'joppa', 'road', ALL, {
    name: 'Jerusalem – Joppa road',
    desc: 'Up from the coast through the hills of Judaea; Jerusalem\'s link to the sea.',
    sources: ['Ezra 3:7', 'Acts 9:36–43', 'Itinerarium Burdigalense (AD 333)'],
  });
  R('jerusalem', 'damascus', 'road', ALL, {
    name: 'Road through Galilee',
    via: ['jericho', 'galilee'],
    desc: 'Via the Jordan valley and Galilee. Saul of Tarsus was on this road when he had his vision near Damascus.',
    sources: ['Acts 9:1–8', 'Josephus, Life 52'],
  });
  R('sidon', 'damascus', 'road', ALL, {
    name: 'Over the Lebanon',
    desc: 'Across the Lebanon range and the Beqaa valley to the oasis of Damascus.',
    sources: ['Strabo 16.2.16–20'],
  });
  R('tyre', 'sidon', 'road', ROMAN, {
    name: 'Phoenician coast road',
    desc: 'Coast road through the Phoenician cities.',
    sources: ['Itinerarium Burdigalense (AD 333)', 'Strabo 16.2.24'],
  });
  R('tyre', 'caesarea', 'road', ROMAN, {
    name: 'Coast road (Via Maris)',
    desc: 'The Bordeaux pilgrim of 333 followed this coast road via Ptolemais to Caesarea.',
    sources: ['Itinerarium Burdigalense (AD 333)', 'Acts 21:7–8'],
  });
  R('caesarea', 'joppa', 'road', ROMAN, {
    name: 'Coast road',
    desc: 'Along the Sharon plain.',
    sources: ['Acts 10:1–24', 'Itinerarium Antonini'],
  });
  R('joppa', 'gaza', 'road', ROMAN, {
    name: 'Coast road',
    desc: 'Through Jamnia, Azotus and Ascalon.',
    sources: ['Itinerarium Antonini', 'Madaba Map (6th century)'],
  });
  R('jerusalem', 'gaza', 'road', ROMAN, {
    name: 'Road down to Gaza',
    desc: '"Go south to the road that goes down from Jerusalem to Gaza" — where Philip met the Ethiopian official.',
    sources: ['Acts 8:26'],
  });
  R('pelusium', 'alexandria', 'road', ROMAN, {
    name: 'Delta road',
    via: ['nile_delta', 'canopus'],
    desc: 'Overland and by canal boat across the Delta.',
    sources: ['Itinerarium Antonini', 'Strabo 17.1.21'],
  });
  R('petra', 'gaza', 'road', ['0ce'], {
    name: 'Incense Road',
    via: ['avdat'],
    desc: 'Frankincense and myrrh from southern Arabia reached the Mediterranean at Gaza by camel caravan via Petra. Pliny counts 65 camel stages from Thomna to Gaza.',
    sources: ['Pliny, Natural History 12.63–65', 'Strabo 16.4.24'],
  });
  R('petra', 'damascus', 'road', ['0ce'], {
    name: 'King\'s Highway',
    via: ['rabbath', 'bostra'],
    desc: 'The ancient road along the edge of the desert east of the Jordan, later paved by Trajan as the Via Nova Traiana.',
    sources: ['Numbers 20:17', 'Strabo 16.4.21'],
  });
  R('damascus', 'palmyra', 'road', ['0ce'], {
    name: 'Desert caravan road',
    desc: 'Palmyra grew rich as the caravan link between the Roman Levant and Parthia.',
    sources: ['Pliny, Natural History 5.88', 'Palmyrene caravan inscriptions'],
  });
  R('palmyra', 'ctesiphon', 'road', ['0ce'], {
    name: 'Palmyrene caravan route',
    via: ['palmyra_desert', 'dura', 'hit'],
    desc: 'Palmyrene caravans crossed to the Euphrates and on to the markets of Seleucia–Ctesiphon and the Gulf.',
    sources: ['Pliny, Natural History 5.88', 'Strabo 16.1.27'],
  });
  R('damascus', 'antioch', 'road', ROMAN, {
    name: 'Orontes road',
    via: ['emesa', 'apamea'],
    desc: 'North through Emesa and Apamea along the Orontes valley.',
    sources: ['Itinerarium Antonini', 'Strabo 16.2.10'],
  });
  R('antioch', 'sidon', 'road', ROMAN, {
    name: 'Coast road via Laodicea & Berytus',
    via: ['laodicea_mare', 'berytus'],
    desc: 'The pilgrim road south from Antioch along the Phoenician coast.',
    sources: ['Itinerarium Burdigalense (AD 333)'],
  });
  R('antioch', 'zeugma', 'road', ['0ce'], {
    name: 'Road to the Euphrates',
    via: ['hierapolis_bamb'],
    desc: 'To the bridge over the Euphrates, the gateway to Parthia.',
    sources: ['Strabo 16.1.22–23', 'Isidore of Charax, Parthian Stations 1'],
  });
  R('antioch', 'edessa', 'road', ['500ad'], {
    name: 'Road to Osrhoene',
    via: ['hierapolis_bamb'],
    desc: 'Military road across the Euphrates to the frontier province of Osrhoene.',
    sources: ['Chronicle of Pseudo-Joshua the Stylite (Persian war of 502–506)', 'Egeria, Itinerarium 17–19 (visit to Edessa)'],
  });
  R('edessa', 'nisibis', 'road', ['500ad'], {
    name: 'Frontier road',
    via: ['carrhae', 'singara'],
    desc: 'Nisibis, ceded to Persia in 363, was one of three authorised crossing points for Roman–Persian trade.',
    sources: ['Codex Justinianus 4.63.4', 'Ammianus Marcellinus 25.7–9'],
  });

  // ===================================================================== ROADS — ANATOLIA & BALKANS (Roman)
  R('tarsus', 'antioch', 'road', ROMAN, {
    name: 'Through the Syrian Gates',
    via: ['issus', 'syrian_gates'],
    desc: 'Past the battlefield of Issus and over the Amanus pass.',
    sources: ['Itinerarium Burdigalense (AD 333)', 'Strabo 14.5.18–19'],
  });
  R('ancyra', 'tarsus', 'road', ROMAN, {
    name: 'Pilgrim road via Tyana & Cilician Gates',
    via: ['tyana', 'cilician_gates'],
    desc: 'The Bordeaux pilgrim (333) and Egeria (384) took this road through Cappadocia and the Cilician Gates.',
    sources: ['Itinerarium Burdigalense (AD 333)', 'Egeria, Itinerarium 23'],
  });
  R('nicomedia', 'ancyra', 'road', ROMAN, {
    name: 'Military road to Galatia',
    via: ['nicaea', 'juliopolis'],
    desc: 'The main highway from the Bosporus into central Anatolia.',
    sources: ['Itinerarium Burdigalense (AD 333)', 'Itinerarium Antonini'],
  });
  R('byzantium', 'nicomedia', 'road', ROMAN, {
    name: 'Across the Bosporus to Bithynia',
    desc: 'Across to Chalcedon and along the Gulf of Astacus.',
    sources: ['Itinerarium Burdigalense (AD 333)', 'Pliny the Younger, Letters 10.41'],
  });
  R('sardis', 'ancyra', 'road', ROMAN, {
    name: 'Old Royal Road',
    via: ['gordion'],
    desc: 'The western section of the old Persian Royal Road, still in use.',
    sources: ['Herodotus 5.52', 'Itinerarium Antonini'],
  });
  R('pergamon', 'ephesus', 'road', ['0ce'], {
    name: 'Road of Asia',
    via: ['smyrna'],
    desc: 'The road linking the cities of the Seven Churches of Asia; Manius Aquillius paved it in 129 BC.',
    sources: ['Revelation 1:11', 'Milestones of M\'. Aquillius'],
  });
  R('pergamon', 'sardis', 'road', ['0ce'], {
    name: 'Pergamum – Sardis road',
    desc: 'Inland road between two of the Seven Churches of Asia.',
    sources: ['Revelation 1:11'],
  });
  R('dyrrachium', 'thessalonica', 'road', ROMAN, {
    name: 'Via Egnatia (west)',
    via: ['lychnidus', 'heraclea_lync', 'edessa_mac', 'pella'],
    desc: 'Built c. 146–120 BC across the Balkan mountains; Strabo says it was measured and marked with milestones for 535 miles from Apollonia to Cypsela.',
    sources: ['Strabo 7.7.4', 'Polybius 34.12'],
  });
  R('thessalonica', 'byzantium', 'road', ROMAN, {
    name: 'Via Egnatia (east)',
    via: ['amphipolis', 'philippi', 'cypsela', 'perinthus'],
    desc: 'Past Amphipolis and Philippi through Thrace to Byzantium; in late antiquity the main land route between Italy and Constantinople.',
    sources: ['Strabo 7.7.4', 'Acts 16:11–17:1', 'Itinerarium Burdigalense (AD 333)'],
  });
  R('athens', 'thessalonica', 'road', ROMAN, {
    name: 'Road through Thermopylae',
    via: ['thebes_gr', 'thermopylae', 'larissa'],
    desc: 'North through Boeotia, the pass of Thermopylae and Thessaly.',
    sources: ['Itinerarium Antonini', 'Pausanias 10'],
  });
  R('corinth', 'athens', 'road', ALL, {
    name: 'Isthmus road via Megara & Eleusis',
    via: ['megara', 'eleusis'],
    desc: 'Over the Isthmus and the Scironian cliffs — where, in myth, Theseus killed the bandit Sciron — then by Eleusis along the Sacred Way.',
    sources: ['Pausanias 1.36–44', 'Plutarch, Theseus 10'],
  });
  R('sparta', 'corinth', 'road', ['500bc', '0ce'], {
    name: 'Road through Arcadia',
    desc: 'The overland route across the Peloponnese. The runner Pheidippides covered the road from Athens to Sparta (about 246 km) in two days in 490 BC.',
    sources: ['Herodotus 6.105–106', 'Pausanias 2–3'],
  });
  R('sinope', 'ancyra', 'road', ROMAN, {
    name: 'Road to the Pontic coast',
    desc: 'Through Paphlagonia to Sinope.',
    sources: ['Itinerarium Antonini', 'Strabo 12.3'],
  });

  // ===================================================================== ROADS — ITALY
  R('rome', 'caere', 'road', ['500bc'], {
    name: 'Road to Caere',
    desc: 'Rome and Caere were close allies; Livy says the Vestal Virgins took refuge at Caere when the Gauls sacked Rome (c. 390 BC).',
    sources: ['Livy 5.40'],
  });
  R('rome', 'kyme', 'road', ['500bc'], {
    name: 'Through Latium to Campania',
    via: ['tarracina'],
    desc: 'During the famine of 492 BC Roman envoys travelled to Cumae to buy grain.',
    sources: ['Livy 2.34', 'Dionysius of Halicarnassus 7.2–12'],
  });
  R('rome', 'capua', 'road', ROMAN, {
    name: 'Via Appia',
    via: ['forum_appii', 'tarracina'],
    desc: 'The "queen of roads", built by Appius Claudius in 312 BC. Procopius says a well-girt traveller covers Rome–Capua in five days, marvelling that its stones still fit tightly after centuries. Paul was met by believers at Forum Appii and Three Taverns.',
    sources: ['Procopius, Wars 5.14.6–11', 'Acts 28:15', 'Horace, Satires 1.5'],
  });
  R('capua', 'puteoli', 'road', ROMAN, {
    name: 'Via Campana',
    desc: 'Link from the Via Appia to the harbour at Puteoli.',
    sources: ['Acts 28:13–14', 'Statius, Silvae 4.3 (Via Domitiana)'],
  });
  R('capua', 'taras', 'road', ROMAN, {
    name: 'Via Appia (south)',
    via: ['beneventum', 'venusia'],
    desc: 'Through Beneventum and Venusia — Horace\'s home town — to Tarentum.',
    sources: ['Strabo 6.3.7', 'Itinerarium Antonini'],
  });
  R('taras', 'brundisium', 'road', ROMAN, {
    name: 'Via Appia (final stretch)',
    desc: 'Across the heel of Italy to Brundisium.',
    sources: ['Strabo 6.3.7'],
  });
  R('capua', 'brundisium', 'road', ROMAN, {
    name: 'Horace\'s road (later Via Traiana)',
    via: ['beneventum', 'canusium', 'barium', 'egnatia'],
    desc: 'In 37 BC Horace travelled with Maecenas from Rome to Brundisium in about two weeks, by Beneventum, Canusium and Barium, grumbling about bad water, gnats and a cheating innkeeper. Trajan paved this route in AD 109.',
    sources: ['Horace, Satires 1.5', 'Strabo 6.3.7'],
    byPeriod: { '500ad': { name: 'Via Traiana' } },
  });
  R('rome', 'ariminum', 'road', ROMAN, {
    name: 'Via Flaminia',
    via: ['narni', 'fanum'],
    desc: 'Built in 220 BC across the Apennines to the Adriatic. In late antiquity it linked Rome with the court at Ravenna.',
    sources: ['Strabo 5.1.11', 'Res Gestae Divi Augusti 20 (Augustus restores it)'],
  });
  R('ariminum', 'ravenna', 'road', ROMAN, {
    name: 'Via Popillia',
    desc: 'Coastal road north through the marshes to Ravenna.',
    sources: ['Itinerarium Antonini'],
  });
  R('ariminum', 'mediolanum', 'road', ROMAN, {
    name: 'Via Aemilia',
    via: ['bononia', 'mutina', 'placentia'],
    desc: 'Built in 187 BC along the edge of the Apennines through Bononia and Mutina to Placentia.',
    sources: ['Strabo 5.1.11', 'Livy 39.2'],
  });
  R('ravenna', 'aquileia', 'road', ['0ce'], {
    name: 'Via Popillia–Annia',
    via: ['po_delta', 'altinum'],
    desc: 'Through the lagoons of the Veneto to Aquileia; much traffic went by inland waterways.',
    sources: ['Strabo 5.1.5–8', 'Itinerarium Antonini'],
  });
  R('mediolanum', 'aquileia', 'road', ['0ce'], {
    name: 'Via Postumia route',
    via: ['verona'],
    desc: 'Across the Po plain through Verona.',
    sources: ['Itinerarium Antonini', 'Itinerarium Burdigalense (AD 333)'],
  });
  R('mediolanum', 'lugdunum', 'road', ROMAN, {
    name: 'Over the Alps (Alpis Graia)',
    via: ['augusta_praetoria', 'alpis_graia'],
    desc: 'Agrippa built roads from Lugdunum, one of which crossed the Little St Bernard pass into Italy. Sidonius Apollinaris crossed the Alps by the cursus publicus in 467.',
    sources: ['Strabo 4.6.7, 4.6.11', 'Sidonius Apollinaris, Letters 1.5'],
  });
  R('rome', 'arelate', 'road', ROMAN, {
    name: 'Via Aurelia & Via Julia Augusta',
    via: ['pisa', 'genua', 'forum_julii', 'aquae_sextiae'],
    desc: 'The coast road from Rome to Gaul, completed by Augustus in 13–12 BC. In 417 Rutilius Namatianus chose to go by sea because the Goths had wrecked the road and its bridges.',
    sources: ['Strabo 4.6.3', 'Rutilius Namatianus, De Reditu Suo 1.37–42'],
  });
  R('syracuse', 'lilybaeum', 'road', ROMAN, {
    name: 'Sicilian coast road',
    via: ['agrigentum'],
    desc: 'Along the south coast of Sicily via Agrigentum.',
    sources: ['Itinerarium Antonini', 'Cicero, Verrines 2.5'],
  });

  // ===================================================================== ROADS — GAUL, SPAIN, AFRICA
  R('massalia', 'arelate', 'road', ROMAN, {
    name: 'Road to Arelate',
    desc: 'A short road; Marius cut a canal (Fossae Marianae) to give ships access to the Rhône.',
    sources: ['Strabo 4.1.8', 'Plutarch, Marius 15'],
  });
  R('arelate', 'narbo', 'road', ROMAN, {
    name: 'Via Domitia',
    via: ['nemausus'],
    desc: 'The first Roman road in Gaul (118 BC), linking Italy to Spain.',
    sources: ['Strabo 4.1.3', 'Cicero, Pro Fonteio 18', 'Vicarello Goblets (Gades–Rome itinerary)'],
  });
  R('narbo', 'tarraco', 'road', ROMAN, {
    name: 'Via Domitia / Via Augusta over the Pyrenees',
    via: ['summus_pyrenaeus', 'gerunda', 'barcino'],
    desc: 'Across the eastern Pyrenees at the Summum Pyrenaeum pass, where Pompey set up his trophies.',
    sources: ['Strabo 3.4.9', 'Vicarello Goblets'],
  });
  R('narbo', 'tolosa', 'road', ROMAN, {
    name: 'Aquitanian road',
    via: ['carcaso'],
    desc: 'Strabo describes the short isthmus route from Narbo over to the Garonne and the Ocean.',
    sources: ['Strabo 4.1.14'],
  });
  R('tarraco', 'carthago_nova', 'road', ROMAN, {
    name: 'Via Augusta (coast)',
    via: ['saguntum', 'valentia'],
    desc: 'Augustus\'s rebuilding of the old Via Herculea along the eastern coast of Spain.',
    sources: ['Strabo 3.4.9', 'Vicarello Goblets'],
  });
  R('carthago_nova', 'corduba', 'road', ROMAN, {
    name: 'Via Augusta (inland)',
    via: ['castulo'],
    desc: 'Inland via the mining town of Castulo into the Baetis valley.',
    sources: ['Strabo 3.4.9', 'Vicarello Goblets'],
  });
  R('hispalis', 'gades', 'road', ROMAN, {
    name: 'Via Augusta to Gades',
    desc: 'The final stretch of the road that, according to the Vicarello Goblets, ran 1,840 Roman miles from Gades to Rome.',
    sources: ['Vicarello Goblets', 'Itinerarium Antonini'],
  });
  R('carthage', 'leptis', 'road', ROMAN, {
    name: 'Coast road through Byzacena & Tripolitania',
    via: ['tacapae', 'sabratha'],
    desc: 'Along the coast of the Lesser Syrtis through Tacapae and the Three Cities (Tripolis).',
    sources: ['Itinerarium Antonini', 'Procopius, Wars 3.14–17 (Belisarius\'s march, 533)'],
  });
  R('leptis', 'cyrene', 'road', ROMAN, {
    name: 'Around the Greater Syrtis',
    via: ['arae_philaenorum', 'berenice_cyr'],
    desc: 'A desolate coast road around the Gulf of Sidra past the Altars of the Philaeni, boundary between Carthage and Cyrene. Sailors dreaded the Syrtis shoals (Acts 27:17), so many went overland.',
    sources: ['Sallust, Jugurtha 19, 79', 'Strabo 17.3.20', 'Itinerarium Antonini'],
  });

  AWT.routes = routes;
})();
