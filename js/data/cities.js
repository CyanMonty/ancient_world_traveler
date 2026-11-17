window.AWT = window.AWT || {};

/*
 * Cities. Each entry lists the periods in which the city existed as a
 * significant place, with its contemporary name, an importance rank
 * (1 = capital / great city, 2 = major city, 3 = town / port) and a note.
 */
(function () {
  const cities = [];
  function C(id, lat, lng, modern, periods) {
    const p = {};
    for (const [key, v] of Object.entries(periods)) p[key] = { name: v[0], rank: v[1], note: v[2] };
    cities.push({ id, lat, lng, modern, periods: p });
  }

  // ---------------------------------------------------------------- Italy & islands
  C('rome', 41.8925, 12.4853, 'Rome, Italy', {
    '500bc': ['Roma', 2, 'A young republic: the last king, Tarquinius Superbus, was traditionally expelled in 509 BC. Rome dominates Latium and has just signed its first treaty with Carthage (Polybius 3.22).'],
    '0ce': ['Roma', 1, 'Capital of the empire and the largest city in the world, with perhaps a million inhabitants, fed by grain fleets from Egypt, Africa and Sicily.'],
    '500ad': ['Roma', 2, 'Still the seat of the Senate and the Pope, but ruled by the Ostrogothic king Theoderic, who visited the city in 500. Its population has fallen dramatically since the sacks of 410 and 455.'],
  });
  C('caere', 42.0, 12.1, 'Cerveteri, Italy', {
    '500bc': ['Caere (Cisra)', 2, 'Wealthy Etruscan city. At its port of Pyrgi the gold "Pyrgi tablets" (c. 500 BC), in Etruscan and Phoenician, record King Thefarie Velianas honouring Uni-Astarte — evidence of the Etruscan–Carthaginian alliance.'],
  });
  C('kyme', 40.848, 14.054, 'Cuma, Italy', {
    '500bc': ['Kyme (Cumae)', 2, 'The oldest Greek colony on the Italian mainland. Under the tyrant Aristodemus it fought off the Etruscans and sold grain to Rome during the famine of 492 BC (Livy 2.34).'],
  });
  C('ostia', 41.7556, 12.2917, 'Ostia Antica, Italy', {
    '0ce': ['Ostia', 3, 'Rome\'s river-mouth port, where cargo was transferred to barges for the trip up the Tiber.'],
    '500ad': ['Portus Romae', 3, 'The artificial harbour built by Claudius and Trajan beside Ostia, still Rome\'s gateway to the sea.'],
  });
  C('puteoli', 40.8228, 14.1217, 'Pozzuoli, Italy', {
    '0ce': ['Puteoli', 2, 'The great port of Campania and main arrival point of the Alexandrian grain ships; St Paul landed here (Acts 28:13).'],
    '500ad': ['Puteoli', 3, 'A declining harbour town; trade has largely moved to Portus.'],
  });
  C('capua', 41.0833, 14.25, 'Santa Maria Capua Vetere, Italy', {
    '0ce': ['Capua', 2, 'Rich Campanian city on the Via Appia, famed for bronze work, perfumes and gladiator schools.'],
    '500ad': ['Capua', 3, 'Still a junction on the Via Appia under Ostrogothic rule.'],
  });
  C('taras', 40.4644, 17.247, 'Taranto, Italy', {
    '500bc': ['Taras', 2, 'Spartan colony with the best harbour in southern Italy; a leading city of Magna Graecia.'],
    '0ce': ['Tarentum', 3, 'A quiet Roman municipium on the Via Appia, past its Hellenistic glory.'],
    '500ad': ['Tarentum', 3, 'Port town of Ostrogothic Italy.'],
  });
  C('brundisium', 40.6383, 17.9458, 'Brindisi, Italy', {
    '0ce': ['Brundisium', 2, 'End of the Via Appia and the usual port for the crossing to Greece and the East.'],
    '500ad': ['Brundisium', 3, 'Adriatic port of Ostrogothic Italy, facing the Eastern Empire across the strait.'],
  });
  C('ariminum', 44.0594, 12.5683, 'Rimini, Italy', {
    '0ce': ['Ariminum', 3, 'Where the Via Flaminia from Rome meets the Via Aemilia to the Po valley; Augustus\'s arch (27 BC) still stands.'],
    '500ad': ['Ariminum', 3, 'Road junction south of Ravenna.'],
  });
  C('ravenna', 44.4175, 12.2, 'Ravenna, Italy', {
    '0ce': ['Ravenna', 3, 'Augustus based the Adriatic fleet at nearby Classis.'],
    '500ad': ['Ravenna', 1, 'Capital of Theoderic the Great\'s Ostrogothic kingdom, protected by marshes and the sea; Theoderic\'s palace and churches are being built.'],
  });
  C('aquileia', 45.7689, 13.3667, 'Aquileia, Italy', {
    '0ce': ['Aquileia', 2, 'Great trading city at the head of the Adriatic, gateway to the Danube lands and the amber trade.'],
  });
  C('mediolanum', 45.4642, 9.19, 'Milan, Italy', {
    '0ce': ['Mediolanum', 3, 'Prosperous city of Cisalpine Gaul.'],
    '500ad': ['Mediolanum', 2, 'Former imperial capital (286–402) and great see of St Ambrose, now an Ostrogothic city.'],
  });
  C('rhegion', 38.11, 15.65, 'Reggio Calabria, Italy', {
    '500bc': ['Rhegion', 3, 'Greek colony guarding the Strait of Messina, ruled from 494 BC by the tyrant Anaxilas.'],
    '0ce': ['Rhegium', 3, 'Port on the Strait of Messina where St Paul\'s ship waited for a south wind (Acts 28:13).'],
    '500ad': ['Rhegium', 3, 'Crossing point to Sicily.'],
  });
  C('syracuse', 37.0755, 15.2866, 'Syracuse, Sicily', {
    '500bc': ['Syrakousai', 2, 'Rich Corinthian colony; within a generation Gelon will make it the greatest Greek city in the west.'],
    '0ce': ['Syracusae', 2, 'Capital of the Roman province of Sicily.'],
    '500ad': ['Syracusae', 2, 'Chief city of Ostrogothic Sicily.'],
  });
  C('akragas', 37.29, 13.585, 'Agrigento, Sicily', {
    '500bc': ['Akragas', 2, 'Prosperous Greek city famed for its temples; Pindar called it "the fairest city of mortals".'],
  });
  C('motya', 37.8678, 12.4686, 'Mozia, Sicily', {
    '500bc': ['Motya', 3, 'Phoenician island-town off western Sicily, Carthage\'s foothold on the island.'],
  });
  C('lilybaeum', 37.8, 12.43, 'Marsala, Sicily', {
    '0ce': ['Lilybaeum', 3, 'Port of western Sicily, closest point to Africa.'],
    '500ad': ['Lilybaeum', 3, 'Given to the Vandals c. 500 as the dowry of Theoderic\'s sister Amalafrida when she married King Thrasamund.'],
  });
  C('carales', 39.2238, 9.1217, 'Cagliari, Sardinia', {
    '500bc': ['Karalis', 3, 'Phoenician harbour town; Carthage has been extending its control over Sardinia.'],
    '0ce': ['Carales', 3, 'Main port of Sardinia, a grain supplier of Rome.'],
    '500ad': ['Carales', 3, 'Vandal-held Sardinia\'s chief city.'],
  });

  // ---------------------------------------------------------------- Gaul & Iberia
  C('massalia', 43.2965, 5.3698, 'Marseille, France', {
    '500bc': ['Massalia', 2, 'Founded c. 600 BC by Greeks from Phocaea; trades wine and goods up the Rhône to the Celts.'],
    '0ce': ['Massilia', 2, 'Old Greek city, still a centre of learning, now within Roman Gallia Narbonensis.'],
    '500ad': ['Massilia', 3, 'Port held by the Visigoths (Provence passes to the Ostrogoths in 508).'],
  });
  C('emporion', 42.1347, 3.1206, 'Empúries, Spain', {
    '500bc': ['Emporion', 3, 'Greek trading post ("the market") founded by Phocaeans from Massalia.'],
  });
  C('gades', 36.5297, -6.2925, 'Cádiz, Spain', {
    '500bc': ['Gadir', 2, 'Ancient Phoenician city beyond the Pillars of Heracles, with a famous temple of Melqart; gateway to the silver of Tartessos.'],
    '0ce': ['Gades', 2, 'Wealthy port of Baetica whose shipowners were famous; Strabo says it had more men of equestrian rank than any city but Rome.'],
    '500ad': ['Gades', 3, 'Hispano-Roman port in Visigothic-claimed Baetica.'],
  });
  C('hispalis', 37.3891, -5.9845, 'Seville, Spain', {
    '0ce': ['Hispalis', 2, 'River port on the Baetis where sea-going ships loaded olive oil for Rome.'],
    '500ad': ['Hispalis', 2, 'Major city of the south; Isidore of Seville will be its bishop a century later.'],
  });
  C('corduba', 37.8845, -4.7796, 'Córdoba, Spain', {
    '0ce': ['Corduba', 2, 'Capital of Hispania Baetica; birthplace of the Senecas.'],
    '500ad': ['Corduba', 2, 'Largely self-governing Hispano-Roman city.'],
  });
  C('carthago_nova', 37.6, -0.986, 'Cartagena, Spain', {
    '0ce': ['Carthago Nova', 2, 'Founded by Hasdrubal the Carthaginian in 227 BC; Roman colony with rich silver mines.'],
    '500ad': ['Carthago Spartaria', 3, 'Port city; it will become the capital of Byzantine Spania after 552.'],
  });
  C('tarraco', 41.1189, 1.2445, 'Tarragona, Spain', {
    '0ce': ['Tarraco', 2, 'Capital of Hispania Tarraconensis, where Augustus wintered in 26–25 BC.'],
    '500ad': ['Tarraco', 3, 'Visigothic since the 470s.'],
  });
  C('narbo', 43.1839, 3.0042, 'Narbonne, France', {
    '0ce': ['Narbo Martius', 2, 'First Roman colony in Gaul (118 BC) and capital of Gallia Narbonensis, on the Via Domitia.'],
    '500ad': ['Narbo', 3, 'Visigothic city.'],
  });
  C('tolosa', 43.6045, 1.444, 'Toulouse, France', {
    '0ce': ['Tolosa', 3, 'Town on the route from the Mediterranean to the Atlantic.'],
    '500ad': ['Tolosa', 1, 'Capital of the Visigothic kingdom of Alaric II, until his defeat by Clovis at Vouillé in 507.'],
  });
  C('arelate', 43.6766, 4.6278, 'Arles, France', {
    '0ce': ['Arelate', 3, 'Colony of Caesar\'s veterans and Rhône river port.'],
    '500ad': ['Arelate', 2, 'Seat of the Prefecture of the Gauls since c. 407; held by the Visigoths in 500.'],
  });
  C('lugdunum', 45.76, 4.835, 'Lyon, France', {
    '0ce': ['Lugdunum', 2, 'Founded in 43 BC, capital of the Three Gauls and hub of Agrippa\'s road network.'],
    '500ad': ['Lugdunum', 2, 'A royal seat of the Burgundian kings.'],
  });

  // ---------------------------------------------------------------- Africa
  C('carthage', 36.8528, 10.3233, 'Tunis, Tunisia', {
    '500bc': ['Qart-Hadasht', 1, 'Phoenician "New City", leader of the western Phoenician world, controlling sea lanes from Sicily to the Atlantic.'],
    '0ce': ['Carthago', 1, 'Destroyed in 146 BC, refounded as a Roman colony by Caesar and Augustus; capital of Africa Proconsularis.'],
    '500ad': ['Carthago', 1, 'Capital of the Vandal kingdom (since 439), ruled by King Thrasamund.'],
  });
  C('leptis', 32.6383, 14.2906, 'Lebda, Libya', {
    '0ce': ['Lepcis Magna', 2, 'Punic trading town flourishing under Rome; its theatre was dedicated in AD 1–2.'],
    '500ad': ['Lepcis Magna', 3, 'Declining town in the Vandal kingdom, harried by desert raiders.'],
  });
  C('caesarea_maur', 36.6, 2.19, 'Cherchell, Algeria', {
    '0ce': ['Iol Caesarea', 2, 'Capital of the client king Juba II of Mauretania and his wife Cleopatra Selene, daughter of Antony and Cleopatra.'],
    '500ad': ['Caesarea', 3, 'Coastal city between Vandal and Moorish rule.'],
  });
  C('tingis', 35.7595, -5.834, 'Tangier, Morocco', {
    '0ce': ['Tingis', 3, 'Port on the African side of the Strait of Gibraltar.'],
    '500ad': ['Tingis', 3, 'Strait port, crossing point to Spain.'],
  });
  C('cyrene', 32.8256, 21.8585, 'Shahhat, Libya', {
    '500bc': ['Kyrene', 2, 'Greek colony founded from Thera c. 631 BC, rich from horses and silphium; under Persian suzerainty.'],
    '0ce': ['Cyrene', 2, 'Capital of the Roman province of Crete and Cyrenaica.'],
    '500ad': ['Cyrene', 3, 'A shrinking city of the Eastern Empire.'],
  });

  // ---------------------------------------------------------------- Egypt & Levant
  C('naukratis', 30.9, 30.5917, 'Kom Ge\'if, Egypt', {
    '500bc': ['Naukratis', 3, 'Greek trading port on the Canopic branch of the Nile; under Pharaoh Amasis the only Egyptian port open to Greek merchants (Herodotus 2.178–179).'],
  });
  C('memphis', 29.8447, 31.2547, 'Mit Rahina, Egypt', {
    '500bc': ['Memphis', 1, 'Ancient capital of Egypt, seat of the Persian satrap since Cambyses\'s conquest in 525 BC.'],
    '0ce': ['Memphis', 2, 'Still a great religious centre; Strabo describes its temple of Apis.'],
  });
  C('alexandria', 31.2001, 29.9187, 'Alexandria, Egypt', {
    '0ce': ['Alexandria', 1, 'Second city of the empire, home of the Library and the Pharos lighthouse; Strabo calls it the greatest emporium in the world.'],
    '500ad': ['Alexandria', 1, 'Great Christian city and source of Constantinople\'s grain.'],
  });
  C('pelusium', 31.0417, 32.545, 'Tell el-Farama, Egypt', {
    '500bc': ['Pelusium', 3, 'Fortress at the eastern gate of Egypt, where Cambyses defeated the last Saite pharaoh in 525 BC.'],
    '0ce': ['Pelusium', 3, 'Frontier city of Roman Egypt on the road from Syria.'],
    '500ad': ['Pelusium', 3, 'Frontier city and stop for pilgrims to Sinai and Jerusalem.'],
  });
  C('gaza', 31.5, 34.4667, 'Gaza', {
    '500bc': ['Gaza (Kadytis)', 3, 'Herodotus\'s "Kadytis", a city "not much smaller than Sardis", on the road from Phoenicia to Egypt.'],
    '0ce': ['Gaza', 2, 'Terminus of the incense road from Arabia.'],
    '500ad': ['Gaza', 2, 'Flourishing centre of rhetoric and the wine trade.'],
  });
  C('joppa', 32.054, 34.752, 'Jaffa, Israel', {
    '500bc': ['Yafo (Joppa)', 3, 'Port where cedar from Lebanon was landed for the rebuilding of the Jerusalem Temple (Ezra 3:7).'],
    '0ce': ['Joppa', 3, 'Old port of Judaea, overshadowed by Caesarea.'],
    '500ad': ['Joppa', 3, 'Landing place for Holy Land pilgrims.'],
  });
  C('jerusalem', 31.7781, 35.2353, 'Jerusalem', {
    '500bc': ['Yerushalayim', 3, 'Small capital of the Persian province of Yehud; the Second Temple was completed c. 516 BC.'],
    '0ce': ['Hierosolyma', 2, 'Herod the Great\'s rebuilt Temple is one of the wonders of the East.'],
    '500ad': ['Hierosolyma', 2, 'Christianity\'s holy city, full of churches and pilgrims.'],
  });
  C('caesarea', 32.5, 34.892, 'Caesarea, Israel', {
    '0ce': ['Caesarea Maritima', 2, 'Herod\'s new port city (c. 22–10 BC) with a huge artificial harbour; seat of the Roman governors of Judaea.'],
    '500ad': ['Caesarea', 2, 'Capital of Palaestina Prima; hometown of the historian Procopius.'],
  });
  C('tyre', 33.2705, 35.1964, 'Tyre, Lebanon', {
    '500bc': ['Tyre', 2, 'Island city whose merchants founded Carthage and Gadir; its fleet serves the Persian king.'],
    '0ce': ['Tyrus', 2, 'Famous for purple dye and glass.'],
    '500ad': ['Tyrus', 2, 'Metropolis of Phoenice; silk weaving and purple dyeing.'],
  });
  C('sidon', 33.5631, 35.3689, 'Sidon, Lebanon', {
    '500bc': ['Sidon', 2, 'Leading Phoenician city under Persia; its ships were the best in Xerxes\'s fleet.'],
    '0ce': ['Sidon', 3, 'Phoenician port where St Paul visited friends (Acts 27:3).'],
    '500ad': ['Sidon', 3, 'Coastal city on the pilgrim road.'],
  });
  C('damascus', 33.5117, 36.3064, 'Damascus, Syria', {
    '500bc': ['Dimashq', 3, 'Oasis city of the Persian satrapy "Beyond the River".'],
    '0ce': ['Damascus', 2, 'Caravan city of the Decapolis.'],
    '500ad': ['Damascus', 2, 'Strong city of the Eastern frontier.'],
  });
  C('petra', 30.3285, 35.4444, 'Petra, Jordan', {
    '0ce': ['Raqmu (Petra)', 1, 'Rock-cut capital of the Nabataean king Aretas IV, grown rich on the incense trade.'],
  });
  C('palmyra', 34.5503, 38.2683, 'Tadmur, Syria', {
    '0ce': ['Tadmor (Palmyra)', 2, 'Desert oasis whose caravans link the Roman world with Parthian Mesopotamia; the Temple of Bel is dedicated in AD 32.'],
  });
  C('antioch', 36.2021, 36.1606, 'Antakya, Turkey', {
    '0ce': ['Antiochia', 1, 'Capital of Roman Syria and third city of the empire; its port is Seleucia Pieria.'],
    '500ad': ['Antiochia', 1, 'One of the great cities of the East, seat of a patriarch.'],
  });
  C('zeugma', 37.06, 37.87, 'Belkıs, Turkey', {
    '0ce': ['Zeugma', 3, 'Its name means "bridge": the main Euphrates crossing between Roman Syria and Parthia.'],
  });
  C('edessa', 37.159, 38.7917, 'Şanlıurfa, Turkey', {
    '500ad': ['Edessa', 2, 'Frontier stronghold and centre of Syriac Christian learning; besieged by the Persians in 503.'],
  });
  C('nisibis', 37.0667, 41.2167, 'Nusaybin, Turkey', {
    '500ad': ['Nisibis', 2, 'Persian frontier city, one of only three places where Roman–Persian trade was legally allowed (Codex Justinianus 4.63.4, AD 408/9).'],
  });
  C('ctesiphon', 33.0936, 44.5808, 'Salman Pak, Iraq', {
    '0ce': ['Ctesiphon', 1, 'Parthian winter capital on the Tigris, opposite the Greek city of Seleucia.'],
    '500ad': ['Ctesiphon', 1, 'Capital of the Sasanian king Kavad I; its great arched palace hall survives.'],
  });
  C('babylon', 32.5364, 44.4209, 'Hillah, Iraq', {
    '500bc': ['Babylon', 1, 'One of the largest cities in the world and a royal capital of the Persian kings.'],
  });
  C('susa', 32.1894, 48.2575, 'Shush, Iran', {
    '500bc': ['Susa', 1, 'Administrative capital of Darius I, end point of the Royal Road from Sardis.'],
  });

  // ---------------------------------------------------------------- Anatolia & Cyprus
  C('tarsus', 36.9177, 34.8928, 'Tarsus, Turkey', {
    '500bc': ['Tarsus', 3, 'Seat of the Cilician kings under Persia, below the Cilician Gates.'],
    '0ce': ['Tarsus', 2, 'Capital of Cilicia, famous for its schools; birthplace of St Paul.'],
    '500ad': ['Tarsus', 2, 'Stop on the pilgrim road to Jerusalem.'],
  });
  C('salamis', 35.1847, 33.9006, 'Famagusta, Cyprus', {
    '500bc': ['Salamis', 2, 'Leading city-kingdom of Cyprus; it will join the Ionian Revolt in 499 BC.'],
    '0ce': ['Salamis', 3, 'Port city of Roman Cyprus.'],
    '500ad': ['Constantia', 2, 'Rebuilt and renamed after earthquakes; metropolis of Cyprus.'],
  });
  C('sardis', 38.4881, 28.0403, 'Sart, Turkey', {
    '500bc': ['Sparda (Sardis)', 1, 'Former Lydian capital of Croesus, now seat of the Persian satrap and start of the Royal Road.'],
    '0ce': ['Sardes', 3, 'City of Roman Asia recovering from the earthquake of AD 17.'],
    '500ad': ['Sardis', 3, 'Provincial city with a large synagogue.'],
  });
  C('ephesus', 37.9394, 27.3417, 'Selçuk, Turkey', {
    '500bc': ['Ephesos', 2, 'Ionian city of the great temple of Artemis.'],
    '0ce': ['Ephesus', 1, 'Capital of the province of Asia; one of the great cities of the East.'],
    '500ad': ['Ephesus', 2, 'Great Christian city; site of the councils of 431 and 449.'],
  });
  C('miletus', 37.5306, 27.2778, 'Balat, Turkey', {
    '500bc': ['Miletos', 2, 'Greatest Ionian city, mother of dozens of Black Sea colonies; in 499 BC Aristagoras will lead the Ionian Revolt from here.'],
    '0ce': ['Miletus', 3, 'Port city whose harbours are slowly silting up; St Paul met the Ephesian elders here (Acts 20).'],
  });
  C('pergamon', 39.1214, 27.1844, 'Bergama, Turkey', {
    '0ce': ['Pergamum', 2, 'Former Attalid capital with a great library and altar.'],
  });
  C('lindos', 36.0917, 28.0883, 'Lindos, Rhodes', {
    '500bc': ['Lindos', 3, 'The leading town of Rhodes before the city of Rhodes was founded in 408 BC; a partner in the Greek trading post at Naukratis.'],
  });
  C('rhodes', 36.4431, 28.2276, 'Rhodes, Greece', {
    '0ce': ['Rhodos', 2, 'Great maritime republic and school of rhetoric; the Colossus lies fallen since 226 BC.'],
    '500ad': ['Rhodos', 3, 'Port on the grain route from Egypt to Constantinople.'],
  });
  C('myra', 36.26, 29.98, 'Demre, Turkey', {
    '0ce': ['Myra', 3, 'Lycian city whose port Andriake was a stopping place for Alexandrian grain ships (Acts 27:5–6).'],
    '500ad': ['Myra', 3, 'Pilgrimage town of its 4th-century bishop, St Nicholas.'],
  });
  C('byzantium', 41.0086, 28.98, 'Istanbul, Turkey', {
    '500bc': ['Byzantion', 3, 'Megarian colony on the Bosporus, under Persian control since Darius\'s Scythian campaign.'],
    '0ce': ['Byzantium', 3, 'A modest free Greek city controlling the Bosporus tolls.'],
    '500ad': ['Constantinopolis', 1, 'The "New Rome" of Constantine, capital of Emperor Anastasius I and the largest city of the Christian world.'],
  });
  C('nicomedia', 40.7654, 29.9408, 'İzmit, Turkey', {
    '0ce': ['Nicomedia', 2, 'Capital of Bithynia.'],
    '500ad': ['Nicomedia', 2, 'Former residence of Diocletian; first stage on the road east from Constantinople.'],
  });
  C('ancyra', 39.9334, 32.8597, 'Ankara, Turkey', {
    '0ce': ['Ancyra', 2, 'Capital of Galatia; its temple preserves the "Res Gestae" of Augustus.'],
    '500ad': ['Ancyra', 2, 'Junction on the military road to the Persian frontier.'],
  });
  C('gordion', 39.65, 31.98, 'Yassıhüyük, Turkey', {
    '500bc': ['Gordion', 3, 'Old Phrygian capital of King Midas, a station on the Royal Road.'],
  });
  C('sinope', 42.0231, 35.1531, 'Sinop, Turkey', {
    '500bc': ['Sinope', 3, 'Milesian colony and the best harbour of the southern Black Sea.'],
    '0ce': ['Sinope', 2, 'Former capital of Mithridates VI, now a Roman colony.'],
    '500ad': ['Sinope', 3, 'Black Sea port of the Eastern Empire.'],
  });
  C('trapezus', 41.005, 39.7178, 'Trabzon, Turkey', {
    '500bc': ['Trapezous', 3, 'Colony of Sinope; Xenophon\'s Ten Thousand will reach the sea here in 400 BC.'],
    '0ce': ['Trapezus', 3, 'Port for trade with the Caucasus and Armenia.'],
    '500ad': ['Trapezus', 3, 'Port and base for Roman operations in the Caucasus.'],
  });
  C('panticapaeum', 45.35, 36.47, 'Kerch, Crimea', {
    '500bc': ['Pantikapaion', 3, 'Milesian colony on the Cimmerian Bosporus, exporting grain and fish.'],
    '0ce': ['Panticapaeum', 2, 'Capital of the Bosporan kingdom, a Roman client.'],
    '500ad': ['Bosporus', 3, 'Distant Greek city on the edge of the steppe, allied to Constantinople.'],
  });
  C('olbia', 46.6942, 31.9028, 'Parutyne, Ukraine', {
    '500bc': ['Olbia', 3, 'Milesian colony at the mouth of the Bug and Dnieper; Herodotus visited and describes the Scythians around it.'],
    '0ce': ['Olbia', 3, 'Rebuilt after its sack by the Getae c. 50 BC; described by Dio Chrysostom.'],
  });

  // ---------------------------------------------------------------- Greece & Balkans
  C('athens', 37.9715, 23.7257, 'Athens, Greece', {
    '500bc': ['Athenai', 2, 'Newly democratic after the reforms of Cleisthenes (508 BC); in 498 BC it will send ships to help the Ionian Revolt.'],
    '0ce': ['Athenae', 2, 'Cultural and university town of the Roman world.'],
    '500ad': ['Athenae', 3, 'The Neoplatonist Academy still teaches (until 529).'],
  });
  C('corinth', 37.9057, 22.8789, 'Ancient Corinth, Greece', {
    '500bc': ['Korinthos', 2, 'Rich trading city on the Isthmus with two harbours and the "diolkos" ship-haulway between the gulfs.'],
    '0ce': ['Corinthus', 2, 'Destroyed by Rome in 146 BC, refounded by Caesar in 44 BC; capital of Achaea.'],
    '500ad': ['Corinthus', 3, 'Provincial capital of Achaea.'],
  });
  C('sparta', 37.0745, 22.4303, 'Sparti, Greece', {
    '500bc': ['Sparta', 2, 'The leading military power of Greece, head of the Peloponnesian League.'],
    '0ce': ['Sparta', 3, 'A free city with its old customs preserved as a tourist attraction.'],
  });
  C('corcyra', 39.62, 19.92, 'Corfu, Greece', {
    '500bc': ['Kerkyra', 3, 'Corinthian colony with a strong fleet, "on the route to Italy and Sicily" (Thucydides 1.36).'],
    '0ce': ['Corcyra', 3, 'Island stop on the sea route between Greece and Italy.'],
    '500ad': ['Corcyra', 3, 'Island port of the Eastern Empire.'],
  });
  C('dyrrachium', 41.3231, 19.4414, 'Durrës, Albania', {
    '500bc': ['Epidamnos', 3, 'Colony of Corcyra and Corinth on the Illyrian coast.'],
    '0ce': ['Dyrrachium', 2, 'Western terminus of the Via Egnatia; Caesar and Pompey fought here in 48 BC.'],
    '500ad': ['Dyrrachium', 2, 'Birthplace of the reigning emperor Anastasius I.'],
  });
  C('thessalonica', 40.6403, 22.9353, 'Thessaloniki, Greece', {
    '0ce': ['Thessalonica', 2, 'Capital of Macedonia on the Via Egnatia.'],
    '500ad': ['Thessalonica', 1, 'Second city of the European provinces of the Eastern Empire.'],
  });
  C('gortyn', 35.0636, 24.9466, 'Gortyna, Crete', {
    '500bc': ['Gortyn', 3, 'Leading Cretan city; its great law code was inscribed in the 5th century BC.'],
    '0ce': ['Gortyna', 2, 'Capital of the Roman province of Crete and Cyrene, near the harbour of Fair Havens.'],
    '500ad': ['Gortyna', 3, 'Metropolis of Crete.'],
  });

  AWT.cities = cities;
})();
