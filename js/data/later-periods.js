window.AWT = window.AWT || {};

/*
 * Data for the 300 CE (Tetrarchy) and 565 CE (end of Justinian's reign) periods.
 * Loaded after cities.js and routes.js. It:
 *   1. adds period entries to existing places,
 *   2. adds places that only matter in these periods,
 *   3. carries routes over from neighbouring periods, and adds new ones.
 */
(function () {
  const byId = Object.fromEntries(AWT.cities.map((c) => [c.id, c]));

  // P(id, period, name, rank, note)
  function P(id, period, name, rank, note) {
    const c = byId[id];
    if (!c) throw new Error('later-periods: unknown city ' + id);
    c.periods[period] = { name, rank, note };
  }
  function C(id, lat, lng, modern, periods, kind = 'city') {
    const p = {};
    for (const [key, v] of Object.entries(periods)) p[key] = { name: v[0], rank: v[1], note: v[2] };
    const c = { id, lat, lng, modern, kind, periods: p };
    AWT.cities.push(c);
    byId[id] = c;
  }

  // =================================================================== 300 CE
  const T = '300ce';
  // Italy & islands
  P('rome', T, 'Roma', 1, 'Still the symbolic capital, ringed by the new Aurelian Walls (270s), with the vast Baths of Diocletian (298–306) going up. But the emperors now rarely visit, ruling from frontier capitals.');
  P('ostia', T, 'Portus & Ostia', 3, 'Trajan\'s hexagonal harbour at Portus has taken over most of Ostia\'s trade.');
  P('puteoli', T, 'Puteoli', 3, 'Declining harbour town; the grain fleets now unload at Portus.');
  P('capua', T, 'Capua', 2, 'Seat of the governor of Campania.');
  P('taras', T, 'Tarentum', 3, 'Port town of Calabria.');
  P('brundisium', T, 'Brundisium', 3, 'Crossing port to the Balkans.');
  P('ariminum', T, 'Ariminum', 3, 'Junction of the Via Flaminia and Via Aemilia.');
  P('ravenna', T, 'Ravenna', 3, 'Base of the Adriatic fleet at Classis.');
  P('aquileia', T, 'Aquileia', 2, 'One of the great cities of Italy, with an imperial mint and residence, guarding the routes to the Balkans.');
  P('mediolanum', T, 'Mediolanum', 1, 'Residence of Maximian, Augustus of the West; in practice the capital of Italy.');
  P('rhegion', T, 'Rhegium', 3, 'Crossing to Sicily.');
  P('syracuse', T, 'Syracusae', 2, 'Chief city of Sicily, famed for its catacombs.');
  P('lilybaeum', T, 'Lilybaeum', 3, 'Port of western Sicily.');
  P('carales', T, 'Carales', 3, 'Main port of Sardinia.');
  // Gaul, Britain, Spain
  P('massalia', T, 'Massilia', 3, 'Old Greek port, now a provincial city.');
  P('arelate', T, 'Arelate', 2, 'Prosperous Rhône port; Constantine will favour it and the church council of 314 will meet here.');
  P('nemausus', T, 'Nemausus', 3, 'City of Narbonensis with its amphitheatre and aqueduct.');
  P('narbo', T, 'Narbo', 3, 'Old provincial capital on the Via Domitia.');
  P('tolosa', T, 'Tolosa', 3, 'Garonne city on the route to the Atlantic.');
  P('burdigala', T, 'Burdigala', 2, 'Wealthy port and wine town of Aquitania; the poet Ausonius is born here c. 310.');
  P('lugdunum', T, 'Lugdunum', 2, 'Former capital of the Three Gauls, still an important mint, though it suffered in the civil war of 197.');
  P('lutetia', T, 'Lutetia (Parisii)', 3, 'Walled island city on the Seine.');
  P('treverorum', T, 'Augusta Treverorum', 1, 'Residence of Constantius Chlorus, Caesar of the West, with a new palace, basilica and baths; it guards the Rhine frontier.');
  P('colonia', T, 'Colonia Agrippina', 2, 'Fortified Rhine city facing the Franks.');
  P('gades', T, 'Gades', 3, 'Its golden age is past; Avienus will describe the old city as largely empty.');
  P('hispalis', T, 'Hispalis', 2, 'Great river port for Baetican olive oil.');
  P('corduba', T, 'Corduba', 2, 'Home of Bishop Hosius, adviser to Constantine.');
  P('carthago_nova', T, 'Carthago Nova', 2, 'Capital of Diocletian\'s new province of Carthaginiensis.');
  P('tarraco', T, 'Tarraco', 2, 'Capital of Tarraconensis, recovering from Frankish raids of the 260s.');
  P('emerita', T, 'Emerita Augusta', 1, 'Seat of the vicar of the new Diocese of the Spains.');
  P('olisipo', T, 'Olisipo', 3, 'Atlantic port of Lusitania.');
  // Africa
  P('carthage', T, 'Carthago', 1, 'Second city of the West, capital of Africa Proconsularis and a great Christian centre (Cyprian\'s see).');
  P('utica', T, 'Utica', 3, 'Old provincial capital, its harbour silting up.');
  P('hippo', T, 'Hippo Regius', 3, 'Busy port of Numidia.');
  P('leptis', T, 'Lepcis Magna', 2, 'Home town of Septimius Severus, magnificently rebuilt by him c. 200; capital of Diocletian\'s new province of Tripolitania.');
  P('caesarea_maur', T, 'Caesarea', 2, 'Capital of Mauretania Caesariensis.');
  P('tingis', T, 'Tingis', 2, 'Capital of Mauretania Tingitana, which Diocletian attached to the Diocese of the Spains.');
  P('volubilis', T, 'Volubilis', 3, 'Abandoned by the Roman administration c. 285 when the frontier pulled back north, but still inhabited.');
  P('cyrene', T, 'Cyrene', 3, 'Shrinking city of Libya Superior, damaged by earthquake in 262.');
  P('garama', T, 'Garama', 3, 'Capital of the Saharan Garamantes, trading with Roman Tripolitania.');
  // Egypt & Nubia
  P('alexandria', T, 'Alexandria', 1, 'Diocletian besieged the city for eight months in 297–298 to crush a revolt; the column now called "Pompey\'s Pillar" was raised in his honour.');
  P('pelusium', T, 'Pelusium', 3, 'Eastern gateway of Egypt.');
  P('memphis', T, 'Memphis', 3, 'Faded ancient capital.');
  P('babylon_egypt', T, 'Babylon (Egypt)', 3, 'Fortress at the apex of the Delta, rebuilt as a strong fort around this time.');
  P('giza', T, 'The Pyramids', 3, 'Visited by Roman tourists, who scratched graffiti on them.');
  P('thebes', T, 'Thebes (Luxor)', 3, 'The Luxor temple has been converted into a legionary fortress, with an imperial-cult chamber painted with the Tetrarchs.');
  P('syene', T, 'Syene & Philae', 3, 'In 298 Diocletian pulled the frontier back to here and Philae, paying the Nobatae and Blemmyes to guard the south (Procopius, Wars 1.19).');
  P('meroe', T, 'Meroë', 2, 'The Kingdom of Kush is in decline; Aksumite armies will sack the region c. 350.');
  // Levant & east
  P('gaza', T, 'Gaza', 2, 'Prosperous pagan city with its temple of Marnas.');
  P('joppa', T, 'Joppa', 3, 'Small port of Palaestina.');
  P('jerusalem', T, 'Aelia Capitolina', 3, 'Hadrian\'s small Roman colony on the site of Jerusalem. Christian pilgrims already come to see the holy places.');
  P('bethlehem', T, 'Bethlehem', 3, 'Village where Christians already show visitors the cave of the Nativity (Origen, Against Celsus 1.51).');
  P('caesarea', T, 'Caesarea', 1, 'Capital of Palaestina, home of Origen\'s library; Eusebius, the church historian, works here.');
  P('tyre', T, 'Tyrus', 2, 'Metropolis of Phoenicia, famous for purple dye.');
  P('sidon', T, 'Sidon', 3, 'Phoenician coastal city.');
  P('berytus', T, 'Berytus', 2, 'Seat of the empire\'s leading law school.');
  P('heliopolis_syr', T, 'Heliopolis', 3, 'The temple complex of Jupiter, Venus and Bacchus is complete and still busy with pilgrims.');
  P('damascus', T, 'Damascus', 2, 'Arsenal city and start of the Strata Diocletiana.');
  P('petra', T, 'Petra', 3, 'Former Nabataean capital, now a city of the province of Arabia (annexed 106).');
  P('palmyra', T, 'Palmyra', 3, 'Sacked by Aurelian in 273 after Queen Zenobia\'s revolt, now a garrison town with the "Camp of Diocletian" on the Strata Diocletiana.');
  P('resafa', T, 'Rosafa', 3, 'Desert fort on the Strata Diocletiana. The soldier Sergius will be martyred here c. 303, and his shrine will make it a great pilgrimage city.');
  P('antioch', T, 'Antiochia', 1, 'Great city of the East and the emperors\' base for the Persian wars; Diocletian built a palace here.');
  P('edessa', T, 'Edessa', 2, 'Capital of Osrhoene, an early centre of Syriac Christianity.');
  P('nisibis', T, 'Nisibis', 2, 'Roman again since the Peace of Nisibis (299), and named in that treaty as the only legal crossing point for Roman–Persian trade (Peter the Patrician, fr. 14).');
  P('ctesiphon', T, 'Ctesiphon', 1, 'Capital of the Sasanian king Narseh, defeated by Galerius in 298.');
  P('ecbatana', T, 'Hamadan', 2, 'Sasanian city on the Khorasan road.');
  P('behistun', T, 'Bisotun', 3, 'Station on the royal road; Darius\'s relief looks down on passing caravans.');
  P('artaxata', T, 'Artaxata', 2, 'Capital of King Tiridates III of Armenia, restored with Roman help; Armenia will become the first Christian kingdom c. 301.');
  // Anatolia & Black Sea
  P('tarsus', T, 'Tarsus', 2, 'Capital of Cilicia.');
  P('salamis', T, 'Salamis', 3, 'Chief city of Cyprus.');
  P('sardis', T, 'Sardis', 3, 'Capital of Diocletian\'s new province of Lydia.');
  P('ephesus', T, 'Ephesus', 2, 'Capital of Asia; the rebuilt temple of Artemis still stands despite the Gothic raid of 262.');
  P('miletus', T, 'Miletus', 3, 'Its harbours are silting up.');
  P('pergamon', T, 'Pergamum', 3, 'Famous for the Asclepieion where Galen trained.');
  P('rhodes', T, 'Rhodos', 3, 'Island port and capital of the Province of the Islands.');
  P('myra', T, 'Myra', 3, 'Lycian city. Its bishop, later known as St Nicholas, is a young man now.');
  P('halicarnassus', T, 'Halicarnassus', 3, 'The Mausoleum still stands.');
  P('hierapolis', T, 'Hierapolis', 3, 'Spa town with its Plutonium and theatre.');
  P('byzantium', T, 'Byzantium', 2, 'Rebuilt by Septimius Severus after he besieged it in 193–196. Constantine will refound it as Constantinople in 330.');
  P('nicomedia', T, 'Nicomedia', 1, 'Diocletian\'s capital, where he is building a great palace; the edict of the Great Persecution will be posted here in 303.');
  P('ancyra', T, 'Ancyra', 2, 'Capital of Galatia.');
  P('caesarea_capp', T, 'Caesarea', 2, 'Metropolis of Cappadocia.');
  P('sinope', T, 'Sinope', 3, 'Black Sea port of Pontus.');
  P('trapezus', T, 'Trapezus', 3, 'Port sacked by the Goths in 257, since recovered.');
  P('phasis', T, 'Phasis', 3, 'Roman fort in Colchis.');
  P('panticapaeum', T, 'Panticapaeum', 3, 'Capital of the Bosporan kingdom, a Roman client.');
  P('chersonesos', T, 'Chersonesus', 3, 'Greek city of Crimea under Roman protection.');
  P('tomis', T, 'Tomis', 3, 'Capital of Scythia Minor.');
  // Greece & Balkans
  P('athens', T, 'Athenae', 2, 'University city, partly ruined by the Herulian sack of 267.');
  P('corinth', T, 'Corinthus', 2, 'Capital of Achaea.');
  P('sparta', T, 'Sparta', 3, 'Provincial town.');
  P('corcyra', T, 'Corcyra', 3, 'Island port.');
  P('dyrrachium', T, 'Dyrrachium', 2, 'Capital of Epirus Nova and head of the Via Egnatia.');
  P('thessalonica', T, 'Thessalonica', 1, 'Residence of Galerius, Caesar of the East, with his new palace, rotunda and triumphal arch celebrating his Persian victory.');
  P('gortyn', T, 'Gortyna', 2, 'Capital of Crete.');
  P('delphi', T, 'Delphi', 3, 'The oracle still functions, but in decline.');
  P('olympia', T, 'Olympia', 3, 'The games continue; the last known victor is recorded in 385.');
  P('nicopolis', T, 'Nicopolis', 2, 'Capital of Epirus Vetus.');
  P('salona', T, 'Salona', 2, 'Capital of Dalmatia and home town of Diocletian.');
  P('spalatum', T, 'Diocletian\'s Palace (building)', 3, 'The emperor\'s retirement palace is under construction on the bay of Aspalathos; he will move in after abdicating in 305.');
  P('sirmium', T, 'Sirmium', 1, 'Imperial residence on the Sava, birthplace of the emperors Probus and Maximian.');
  P('siscia', T, 'Siscia', 2, 'River port with an imperial mint.');
  P('singidunum', T, 'Singidunum', 3, 'Legionary fortress of the Fourth Flavia on the Danube.');
  P('naissus', T, 'Naissus', 2, 'Birthplace of Constantine (c. 272).');
  P('serdica', T, 'Serdica', 2, 'Capital of Dacia Mediterranea; Galerius will die here in 311.');
  P('aquincum', T, 'Aquincum', 2, 'Legionary fortress and city at its height, with two amphitheatres and a hydraulic organ (Valeria).');
  P('carnuntum', T, 'Carnuntum', 2, 'Great Danube fortress-city; the emperors will meet here in 308 (the Conference of Carnuntum).');

  // New places for 300 CE (Britain) and 565 CE
  C('londinium', 51.512, -0.091, 'London, UK', {
    '300ce': ['Londinium', 2, 'Largest city of Britain. Constantius Chlorus recovered it from the usurper Allectus in 296, as shown on the Arras medallion.'],
  });
  C('eboracum', 53.96, -1.08, 'York, UK', {
    '300ce': ['Eboracum', 2, 'Fortress of the Sixth Legion. Constantius will die here in 306 and his son Constantine will be proclaimed emperor by the troops.'],
  });
  C('hadrians_wall', 55.013, -2.33, 'Housesteads, Northumberland, UK', {
    '300ce': ['Hadrian\'s Wall (Vercovicium)', 3, 'The 73-mile wall built from AD 122, still garrisoned against the Picts. Constantius campaigned beyond it in 305.'],
  }, 'fortress');
  C('gesoriacum', 50.726, 1.614, 'Boulogne-sur-Mer, France', {
    '300ce': ['Gesoriacum / Bononia', 3, 'Base of the British fleet (Classis Britannica); Constantius besieged and took it from the usurper Carausius in 293.'],
  });
  C('toletum', 39.857, -4.024, 'Toledo, Spain', {
    '565ce': ['Toletum', 1, 'Royal seat of the Visigothic king Athanagild (d. 567). It will be the kingdom\'s capital until 711.'],
  });
  C('dara', 37.18, 40.94, 'Dara, Turkey', {
    '565ce': ['Dara (Anastasiopolis)', 2, 'Frontier fortress built by Anastasius (505–507) in sight of Persian Nisibis. Belisarius won a famous battle here in 530.'],
  }, 'fortress');
  C('faras', 22.22, 31.48, 'Faras (now under Lake Nubia), Sudan', {
    '565ce': ['Pachoras (Faras)', 2, 'Capital of Nobadia. Its king was converted by a mission sent by Empress Theodora in 543 (John of Ephesus, Ecclesiastical History 4.6–8).'],
  });

  // =================================================================== 565 CE
  const J = '565ce';
  // Italy (Roman again) & islands
  P('rome', J, 'Roma', 2, 'Recovered by Justinian after the ruinous Gothic War (535–554), when it changed hands several times. Its population has collapsed and the aqueducts are broken.');
  P('ostia', J, 'Portus', 3, 'Rome\'s harbour, fought over in the Gothic War.');
  P('capua', J, 'Capua', 3, 'Narses defeated the Franks and Alamanni near here at the Casilinus in 554.');
  P('taras', J, 'Tarentum', 3, 'Roman port in the south.');
  P('brundisium', J, 'Brundisium', 3, 'Adriatic port.');
  P('ariminum', J, 'Ariminum', 3, 'Besieged in the Gothic War.');
  P('ravenna', J, 'Ravenna', 1, 'Seat of the Roman governor of Italy (Narses). San Vitale (547) shows Justinian and Theodora in mosaic.');
  P('aquileia', J, 'Aquileia', 3, 'Its patriarch will flee to Grado when the Lombards invade in 568.');
  P('mediolanum', J, 'Mediolanum', 3, 'Sacked by the Goths and Burgundians in 539, its men reportedly massacred (Procopius, Wars 6.21).');
  P('rhegion', J, 'Rhegium', 3, 'Crossing to Sicily.');
  P('syracuse', J, 'Syracusae', 2, 'Belisarius took Sicily in 535 and celebrated his consulship here.');
  P('lilybaeum', J, 'Lilybaeum', 3, 'Roman port of western Sicily.');
  P('carales', J, 'Carales', 3, 'Roman Sardinia since 534.');
  // Gaul & Spain
  P('massalia', J, 'Massilia', 2, 'Frankish since 536 and their main Mediterranean port, importing papyrus, oil and spices.');
  P('arelate', J, 'Arelate', 2, 'Frankish city, whose bishop Caesarius (d. 542) was a famous preacher.');
  P('nemausus', J, 'Nemausus', 3, 'Visigothic town of Septimania.');
  P('narbo', J, 'Narbo', 2, 'Chief city of Visigothic Septimania.');
  P('tolosa', J, 'Tolosa', 3, 'Frankish since 507.');
  P('burdigala', J, 'Burdigala', 2, 'Frankish city of Aquitaine.');
  P('lugdunum', J, 'Lugdunum', 2, 'Frankish since the conquest of Burgundy in 534.');
  P('lutetia', J, 'Parisius', 1, 'Capital of King Charibert I (561–567).');
  P('tours', J, 'Turonum (Tours)', 2, 'Shrine of St Martin. Gregory, the historian of the Franks, will become bishop in 573.');
  P('treverorum', J, 'Treveri', 2, 'City of the Austrasian Frankish kingdom of Sigibert I.');
  P('colonia', J, 'Colonia', 2, 'Austrasian Frankish city on the Rhine.');
  P('emerita', J, 'Emerita', 2, 'Rich Visigothic city with famous bishops (Lives of the Fathers of Mérida).');
  P('hispalis', J, 'Hispalis', 2, 'Visigothic city of Baetica.');
  P('corduba', J, 'Corduba', 2, 'In open revolt against the Visigothic kings; Leovigild will retake it in 572.');
  P('carthago_nova', J, 'Carthago Spartaria', 2, 'Capital of Byzantine Spania, held since c. 552.');
  P('tarraco', J, 'Tarraco', 3, 'Visigothic port.');
  P('olisipo', J, 'Olisipo', 3, 'Visigothic town on the Tagus.');
  P('gades', J, 'Gades', 3, 'Small port on the edge of Byzantine Spania.');
  // Africa (Roman again)
  P('carthage', J, 'Carthago', 1, 'Capital of Roman Africa, reconquered by Belisarius in 533.');
  P('hippo', J, 'Hippo Regius', 3, 'Roman again; Augustine\'s library survived the Vandals.');
  P('leptis', J, 'Lepcis Magna', 3, 'Reduced to a small walled core, its harbour silting up (Procopius, Buildings 6.4).');
  P('caesarea_maur', J, 'Caesarea', 3, 'Isolated Roman outpost reached by sea.');
  P('tingis', J, 'Tingis', 3, 'Under Moorish control; the Romans hold the fortress of Septem (Ceuta) nearby.');
  P('volubilis', J, 'Volubilis', 3, 'Christian Berber town; its last Latin inscriptions date to the 650s.');
  P('cyrene', J, 'Cyrene', 3, 'A small town; the provincial capital has moved to Ptolemais.');
  P('garama', J, 'Garama', 3, 'The Garamantes will make peace with Rome and accept Christianity c. 569.');
  // Egypt & Nubia
  P('alexandria', J, 'Alexandria', 1, 'Source of Constantinople\'s grain, divided between rival Christian churches.');
  P('pelusium', J, 'Pelusium', 3, 'Where the Plague of Justinian first appeared in 541 (Procopius, Wars 2.22).');
  P('babylon_egypt', J, 'Babylon (Egypt)', 2, 'Fortress city at the apex of the Delta; it will fall to the Arabs in 641.');
  P('giza', J, 'The Pyramids', 3, 'Still clad in their casing stones.');
  P('thebes', J, 'Thebes', 3, 'Monasteries and the village of Djeme fill the old temples.');
  P('syene', J, 'Syene', 3, 'Justinian closed the temple of Isis at Philae c. 537 (Procopius, Wars 1.19).');
  P('abu_mena', J, 'Shrine of St Menas', 2, 'At its height: a pilgrim city with a great basilica and baths.');
  P('sinai', J, 'Monastery of Mount Sinai', 3, 'Justinian has built the fortified monastery at the Burning Bush, later St Catherine\'s.');
  // Levant & east
  P('gaza', J, 'Gaza', 2, 'Famous for its wine, shipped all over the Mediterranean, and its school of rhetoric.');
  P('joppa', J, 'Joppa', 3, 'Pilgrim port.');
  P('jerusalem', J, 'Hierosolyma', 1, 'Justinian\'s Nea Church (543) joins the Holy Sepulchre; the Madaba Map shows the city.');
  P('bethlehem', J, 'Bethlehem', 3, 'Justinian has rebuilt the Church of the Nativity.');
  P('caesarea', J, 'Caesarea', 2, 'Capital of Palaestina Prima, home of the historian Procopius.');
  P('tyre', J, 'Tyrus', 2, 'Silk-weaving city.');
  P('sidon', J, 'Sidon', 3, 'Coastal city.');
  P('berytus', J, 'Berytus', 3, 'Ruined by the earthquake and tsunami of 551; its law school moved to Sidon.');
  P('heliopolis_syr', J, 'Heliopolis', 3, 'Its giant temples are partly ruined.');
  P('damascus', J, 'Damascus', 2, 'Frontier city near the Ghassanid camps.');
  P('petra', J, 'Petra', 3, 'Still a bishopric; papyri found in its church (the Petra Papyri) record property dealings in the 6th century.');
  P('antioch', J, 'Theoupolis (Antioch)', 2, 'Sacked by Khosrow I in 540, rebuilt by Justinian and renamed "City of God".');
  P('qalat_siman', J, 'Shrine of St Simeon Stylites', 3, 'Major pilgrimage centre.');
  P('resafa', J, 'Sergiopolis', 2, 'Pilgrimage city of St Sergius with new walls and cisterns.');
  P('edessa', J, 'Edessa', 2, 'Proud of its image of Christ (the Mandylion), credited with saving it from Khosrow in 544.');
  P('nisibis', J, 'Nisibis', 2, 'Persian frontier city with a famous Christian (Church of the East) school.');
  P('ctesiphon', J, 'Ctesiphon', 1, 'Capital of Khosrow I Anushirvan, with its great vaulted palace hall, the Taq Kasra.');
  P('ecbatana', J, 'Hamadan', 2, 'Sasanian city.');
  P('behistun', J, 'Bisotun', 3, 'Royal road station with an unfinished Sasanian building programme.');
  P('artaxata', J, 'Dvin', 2, 'Capital of Persian Armenia.');
  // Anatolia & Black Sea
  P('byzantium', J, 'Constantinopolis', 1, 'Justinian died here on 14 November 565. Hagia Sophia (537) is the largest church in the world.');
  P('nicomedia', J, 'Nicomedia', 2, 'Bithynian metropolis.');
  P('ancyra', J, 'Ancyra', 2, 'Galatian city.');
  P('caesarea_capp', J, 'Caesarea', 2, 'Cappadocian metropolis.');
  P('tarsus', J, 'Tarsus', 2, 'Cilician city.');
  P('salamis', J, 'Constantia', 2, 'Metropolis of Cyprus.');
  P('ephesus', J, 'Ephesus', 2, 'Justinian\'s great basilica of St John stands on the hill.');
  P('sardis', J, 'Sardis', 3, 'Lydian city.');
  P('rhodes', J, 'Rhodos', 3, 'Island port on the grain route.');
  P('myra', J, 'Myra', 3, 'Pilgrimage to St Nicholas.');
  P('halicarnassus', J, 'Halicarnassus', 3, 'The Mausoleum still stands.');
  P('hierapolis', J, 'Hierapolis', 3, 'Pilgrimage to St Philip.');
  P('sinope', J, 'Sinope', 3, 'Black Sea port.');
  P('trapezus', J, 'Trapezus', 2, 'Base for the Lazic War.');
  P('phasis', J, 'Phasis', 2, 'Port of Lazica, fought over until the Fifty-Year Peace of 562.');
  P('panticapaeum', J, 'Bosporus', 3, 'Roman outpost in Crimea since c. 528.');
  P('chersonesos', J, 'Cherson', 3, 'Roman city of Crimea.');
  P('tomis', J, 'Tomis', 3, 'Frontier city facing the newly arrived Avars.');
  // Greece & Balkans
  P('athens', J, 'Athenae', 3, 'Justinian closed the philosophical schools in 529.');
  P('corinth', J, 'Corinthus', 3, 'Shaken by earthquakes; Justinian walled the Isthmus.');
  P('corcyra', J, 'Corcyra', 3, 'Island port.');
  P('dyrrachium', J, 'Dyrrachium', 2, 'Adriatic gateway of the Via Egnatia.');
  P('thessalonica', J, 'Thessalonica', 1, 'Great city of the Balkans, protected by St Demetrius.');
  P('gortyn', J, 'Gortyna', 3, 'Metropolis of Crete.');
  P('nicopolis', J, 'Nicopolis', 3, 'Shrinking capital of Epirus.');
  P('salona', J, 'Salona', 2, 'Roman again since 535; it will be destroyed by Avars and Slavs c. 614.');
  P('spalatum', J, 'Diocletian\'s Palace (Spalatum)', 3, 'Still standing; refugees from Salona will settle inside its walls in the 7th century, founding the city of Split.');
  P('sirmium', J, 'Sirmium', 2, 'Capital of the Gepids; it will pass to Rome in 567 and fall to the Avars in 582.');
  P('singidunum', J, 'Singidunum', 3, 'Roman Danube fortress rebuilt by Justinian.');
  P('naissus', J, 'Naissus', 3, 'Rebuilt by Justinian.');
  P('serdica', J, 'Serdica', 2, 'Strong city on the Via Militaris.');
  P('aquincum', J, 'Aquincum (ruins)', 3, 'In Lombard Pannonia; the Lombards will leave for Italy in 568 and the Avars will take over.');

  // =================================================================== ROUTES
  const cityIn = (id, p) => byId[id] && byId[id].periods[p];
  // Carry routes over: a route open both in 0 CE and 500 CE was open in 300 CE;
  // a route open in 500 CE stayed open in 565 CE (when both ends exist).
  const extra300 = new Set([
    'sirmium-singidunum-road', 'singidunum-naissus-road', 'naissus-serdica-road', 'serdica-byzantium-road',
    'aquileia-sirmium-road', 'aquincum-singidunum-river', 'carnuntum-aquincum-river', 'aquileia-carnuntum-road',
    'siscia-sirmium-river', 'salona-spalatum-road', 'salona-aquileia-sea', 'salona-ravenna-sea', 'salona-siscia-road',
    'damascus-palmyra-road', 'antioch-resafa-road', 'antioch-edessa-road', 'edessa-nisibis-road', 'nisibis-ctesiphon-river',
    'alexandria-babylon_egypt-river', 'pelusium-babylon_egypt-road', 'babylon_egypt-giza-road', 'babylon_egypt-thebes-river',
    'memphis-babylon_egypt-road', 'giza-memphis-road', 'syene-meroe-river', 'petra-damascus-road', 'petra-gaza-road',
    'alexandria-puteoli-sea', 'gades-ostia-sea', 'tarraco-ostia-sea', 'carales-ostia-sea', 'mediolanum-aquileia-road',
    'olympia-corinth-road', 'sparta-corinth-road', 'ephesus-miletus-sea', 'pergamon-ephesus-road', 'pergamon-sardis-road',
    'alexandria-memphis-river', 'mediolanum-ravenna-river', 'utica-carthage-road',
  ]);
  const extra565 = new Set(['petra-damascus-road']);
  for (const r of AWT.routes) {
    const add = (p) => {
      if (!r.periods.includes(p) && cityIn(r.from, p) && cityIn(r.to, p)) r.periods = [...r.periods, p]; // copy: period arrays are shared
    };
    if ((r.periods.includes('0ce') && r.periods.includes('500ad')) || extra300.has(r.id)) add('300ce');
    if (r.periods.includes('500ad') || extra565.has(r.id)) add('565ce');
  }
  // Period-specific names for carried-over routes
  const rename = (id, period, o) => {
    const r = AWT.routes.find((x) => x.id === id);
    if (!r) throw new Error('later-periods: unknown route ' + id);
    r.byPeriod = r.byPeriod || {};
    r.byPeriod[period] = Object.assign({}, r.byPeriod[period], o);
  };
  rename('damascus-palmyra-road', '300ce', {
    name: 'Strata Diocletiana',
    desc: 'Diocletian\'s fortified desert road, lined with forts and milestones, running from Damascus through Palmyra to the Euphrates.',
    sources: ['Milestones of the Strata Diocletiana', 'Notitia Dignitatum, Oriens 32–33'],
  });
  rename('petra-damascus-road', '300ce', {
    name: 'Via Nova Traiana',
    desc: 'Trajan\'s paved road (111–114) from Bostra to the Red Sea at Aila, built along the old King\'s Highway.',
    sources: ['Milestones of the Via Nova Traiana', 'Tabula Peutingeriana'],
  });
  rename('petra-damascus-road', '565ce', { name: 'Via Nova Traiana' });
  rename('alexandria-puteoli-sea', '300ce', {
    name: 'Alexandrian grain fleet',
    desc: 'Egyptian grain still feeds Rome. After 330 Constantine will divert it to his new capital, Constantinople.',
  });
  rename('nisibis-ctesiphon-river', '300ce', {
    desc: 'Down the Tigris from the new Roman frontier city of Nisibis to the Sasanian capital. The Peace of Nisibis (299) channelled all trade through Nisibis.',
    sources: ['Peter the Patrician, fragment 14', 'Ammianus Marcellinus 25.7'],
  });

  function R(from, to, mode, periods, info) {
    AWT.routes.push(Object.assign({ id: `${from}-${to}-${mode}`, from, to, mode, periods, via: [] }, info));
  }
  // 300 CE — Britain & the Channel
  R('londinium', 'gesoriacum', 'sea', ['300ce'], {
    name: 'Channel crossing (Rutupiae – Gesoriacum)',
    via: ['rutupiae'],
    desc: 'From London down Watling Street to Rutupiae (Richborough), the gateway to Britain, then across the Channel to the fleet base at Gesoriacum.',
    sources: ['Itinerarium Antonini (Iter II)', 'Ammianus Marcellinus 20.1, 27.8'],
    crossing: true,
  });
  R('gesoriacum', 'lutetia', 'road', ['300ce'], {
    name: 'Road via Samarobriva',
    via: ['samarobriva'],
    desc: 'South through Samarobriva (Amiens), on one of Agrippa\'s roads to the Ocean.',
    sources: ['Itinerarium Antonini', 'Strabo 4.6.11'],
  });
  R('londinium', 'eboracum', 'road', ['300ce'], {
    name: 'Ermine Street',
    via: ['lindum'],
    desc: 'The great north road from London through Lindum (Lincoln) to York.',
    sources: ['Itinerarium Antonini (Iter II, V)'],
  });
  R('eboracum', 'hadrians_wall', 'road', ['300ce'], {
    name: 'Dere Street to the Wall',
    via: ['cataractonium'],
    desc: 'North through Cataractonium (Catterick) to the frontier on Hadrian\'s Wall.',
    sources: ['Itinerarium Antonini (Iter I)', 'Vindolanda tablets (c. 100, on travel to the frontier)'],
  });
  R('palmyra', 'resafa', 'road', ['300ce'], {
    name: 'Strata Diocletiana (north)',
    via: ['palmyra_desert'],
    desc: 'The fortified desert road continued north-east from Palmyra toward the Euphrates.',
    sources: ['Notitia Dignitatum, Oriens 33', 'Milestones of the Strata Diocletiana'],
  });
  // 565 CE
  R('toletum', 'emerita', 'road', ['565ce'], {
    name: 'Road to Emerita',
    desc: 'West across the Meseta between the royal seat and the great Lusitanian city.',
    sources: ['Itinerarium Antonini', 'Lives of the Fathers of Mérida'],
  });
  R('toletum', 'corduba', 'road', ['565ce'], {
    name: 'Road over the Sierra Morena',
    desc: 'South to the Baetis valley. King Agila was defeated at Corduba in 550; it remained in revolt.',
    sources: ['Isidore of Seville, History of the Goths 45–47', 'Itinerarium Antonini'],
  });
  R('toletum', 'tarraco', 'road', ['565ce'], {
    name: 'Road via Caesaraugusta',
    via: ['caesaraugusta'],
    desc: 'North-east through Complutum and Caesaraugusta (Zaragoza) to the coast.',
    sources: ['Itinerarium Antonini'],
  });
  R('edessa', 'dara', 'road', ['565ce'], {
    name: 'Frontier road to Dara',
    desc: 'East along the frontier to the fortress that faced Persian Nisibis.',
    sources: ['Procopius, Wars 1.13–14 (battle of Dara, 530)', 'Procopius, Buildings 2.1–3'],
  });
  R('dara', 'nisibis', 'road', ['565ce'], {
    name: 'Across the frontier',
    desc: 'Only about 28 km separated the rival fortresses. Merchants had to trade at the official crossing points.',
    sources: ['Procopius, Wars 1.10', 'Menander Protector fr. 6.1 (treaty of 562)'],
  });
  // Links that keep the graph connected between the anchor periods
  R('athens', 'delphi', 'road', ['500bc', '0ce', '300ce', '500ad'], {
    name: 'Sacred Way to Delphi (the Pythaïs)',
    via: ['eleusis', 'thebes_gr'],
    desc: 'The road of the Athenian sacred embassy (Pythaïs) to Apollo\'s oracle, through Eleusis and Thebes and up past Parnassus.',
    sources: ['Strabo 9.2.11', 'Pausanias 10.5', 'Athenian Treasury inscriptions at Delphi'],
  });
  R('carthago_nova', 'carthage', 'sea', ['0ce', '300ce', '500ad', '565ce'], {
    name: 'New Carthage – Africa crossing',
    via: ['palos_off', 'algiers_off', 'bougaroun_off', 'bizerte_off'],
    desc: 'Hasdrubal founded New Carthage in 227 BC as Carthage\'s base in Spain, facing Africa across the sea. Scipio captured it in a famous assault in 209 BC.',
    sources: ['Polybius 10.8–20', 'Livy 26.42–51'],
  });
  R('capua', 'poseidonia', 'road', ['0ce'], {
    name: 'Via Popilia',
    via: ['nuceria', 'salerno_gulf'],
    desc: 'The road from Capua south through Nuceria toward Rhegium, built by the consul Popillius in 132 BC (Polla inscription).',
    sources: ['Polla inscription (CIL I² 638)', 'Strabo 5.4.13'],
  });
  R('syene', 'faras', 'river', ['565ce'], {
    name: 'Nile into Nobadia',
    via: ['abu_simbel'],
    desc: 'Up the Nile past the First Cataract to the Nobadian capital, the route of Theodora\'s missionaries in 543.',
    sources: ['John of Ephesus, Ecclesiastical History 4.6–8'],
    downstream: 'syene',
  });
})();
