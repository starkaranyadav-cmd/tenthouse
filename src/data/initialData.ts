import { Tent, TentAddon, Booking } from '../types';

export const INITIAL_ADDONS: TentAddon[] = [
  // --- 1. BAITHNE KA SAMAN (बैठने की व्यवस्था) ---
  {
    id: 'addon-b1',
    name: 'Gadda, Razai, Takia & Gol Masnad Set (10 Sets)',
    hindiName: 'गद्दा, रजाई, तकिया व गोल मसनद सेट (10 सेट)',
    category: 'Baithne Ka Saman',
    pricePerDay: 1200,
    description: 'साफ-सुथरे कॉटन गद्दे, सफेद चादर, तकिया व गोल मसनद - जनवासा, बैठक व कथा के लिए उत्तम।',
    unit: '10 सेट / दिन',
    iconName: 'Bed'
  },
  {
    id: 'addon-b2',
    name: 'Nilkamal VIP Plastic Chairs (50 Chairs with White Covers)',
    hindiName: 'नीलकमल वीआईपी कुर्सी (50 कुर्सियां + सफेद कवर व रिबन)',
    category: 'Baithne Ka Saman',
    pricePerDay: 1500,
    description: 'मजबूत नीलकमal फाइबर कुर्सियां, साफ धुले हुए कवर व मैचिंग लाल/गोल्डन रिबन सहित।',
    unit: '50 कुर्सी सेट / दिन',
    iconName: 'Armchair'
  },
  {
    id: 'addon-b3',
    name: 'Maharaja Dulha-Dulhan Stage Sofa Chair',
    hindiName: 'महाराजा दूल्हा-दुल्हन सोफा व जयमाल स्टेज चेयर',
    category: 'Baithne Ka Saman',
    pricePerDay: 2500,
    description: 'रॉयल गोल्डन कार्विंग लेदरेट सोफा - जयमाल स्टेज व खास मेहमानों के बैठने हेतु।',
    unit: '1 सोफा सेट / दिन',
    iconName: 'Crown'
  },
  {
    id: 'addon-b4',
    name: 'Lal Carpet / Red Carpet & Farsh Chandni (200 sq ft)',
    hindiName: 'लाल कालीन व सफेद फर्श की चांदनी (200 sq ft)',
    category: 'Baithne Ka Saman',
    pricePerDay: 800,
    description: 'एंट्री व स्टेज के लिए वेलवेट रेड कारपेट और जमीन पर बैठने के लिए साफ सफेद चांदनी।',
    unit: '200 sq ft / दिन',
    iconName: 'Grid'
  },
  {
    id: 'addon-b5',
    name: 'Dari & Jaajam Rug Set (5 Heavy Cotton Mats)',
    hindiName: 'मजबूत सूती दरी व जाजम (5 बड़ी दरियां)',
    category: 'Baithne Ka Saman',
    pricePerDay: 500,
    description: 'पंगत व फर्श पर बैठने के लिए भारी कॉटन दरी और जाजम।',
    unit: '5 पीस / दिन',
    iconName: 'Layers'
  },
  {
    id: 'addon-b6',
    name: 'Sheesham Lakdi Takhat (6x4 ft Wooden Platform)',
    hindiName: 'लकड़ी का बड़ा तख्त (6x4 फीट) - 2 पीस',
    category: 'Baithne Ka Saman',
    pricePerDay: 600,
    description: 'पंडित जी की पूजा चौकी, जनवासा या स्टेज बेस के लिए मजबूत लकड़ी का तख्त।',
    unit: '2 तख्त / दिन',
    iconName: 'Box'
  },

  // --- 2. SAJANE KA SAMAN (सजावट, गेट व लाइटिंग) ---
  {
    id: 'addon-s1',
    name: 'Jaymala Stage & Mandap Phool Sajavat (Floral Decor)',
    hindiName: 'जयमाल स्टेज व विवाह मंडप ताजे फूल सजावट',
    category: 'Sajane Ka Saman',
    pricePerDay: 4500,
    description: 'गेंदा, गुलाब, आर्किड व फैंसी कपड़े की बैकड्रॉप पर्दा सजावट एवं स्टेज लाइटिंग।',
    unit: 'पूरा स्टेज डेकोर / दिन',
    iconName: 'Sparkles'
  },
  {
    id: 'addon-s2',
    name: 'Grand Swagat Entry Gate (Welcome Toran Dwar)',
    hindiName: 'भव्य स्वागत तोरण द्वार (लाइट, फूल व पिलर गेट)',
    category: 'Sajane Ka Saman',
    pricePerDay: 2000,
    description: 'बारात व अतिथियों के भव्य स्वागत के लिए मुख्य गेट पर लाइट व आर्टिफीसियल फ्लावर डेकोरेशन।',
    unit: '1 गेट / दिन',
    iconName: 'DoorOpen'
  },
  {
    id: 'addon-s3',
    name: 'LED Jhalar Lari, Halogen & Jhoomer Lighting Set',
    hindiName: 'एलईडी झालर लड़ी (20 लड़ी) + 4 हैलोजन + 2 झूमर',
    category: 'Lighting & Sound',
    pricePerDay: 1800,
    description: 'घर, लॉन व पूरे पंडाल को जगमगाने के लिए वॉर्म व्हाइट / मल्टीकलर एलईडी झालर व फोकस लाइट।',
    unit: 'पूरा लाइट सेट / दिन',
    iconName: 'Lamp'
  },
  {
    id: 'addon-s4',
    name: 'DJ Sound System, Mike & Loudspeaker Set',
    hindiName: 'डीजे साउंड बॉक्स + 2 वायरलेस माइक + एम्प्लीफायर',
    category: 'Lighting & Sound',
    pricePerDay: 3000,
    description: 'संगीत, अनाउंसमेंट, कथा व बारात के लिए दमदार साउंड बॉक्स, वायरलेस माइक व मिक्सर।',
    unit: 'साउंड सेट / दिन',
    iconName: 'Volume2'
  },
  {
    id: 'addon-s5',
    name: 'Mist Air Cooler & Jumbo Pedestal Fans (3 Units)',
    hindiName: 'पानी वाला मिस्ट कूलर व जंबो फर्राटा पंखे (3 पीस)',
    category: 'Sajane Ka Saman',
    pricePerDay: 1400,
    description: 'गर्मी के मौसम में पंडाल में ठंडी हवा के लिए 1 वाटर मिस्ट कूलर व 2 जंबो स्टैंड फैन।',
    unit: '3 यूनिट / दिन',
    iconName: 'Snowflake'
  },

  // --- 3. KHANA BNANE KA SAMAN (हलवाई व कैटरिंग के बर्तन) ---
  {
    id: 'addon-k1',
    name: 'Badi Degh, Double Bhatti Chulha & Commercial Cylinder',
    hindiName: 'बड़ी देग (100kg) + हलवाई डबल भट्टी चूल्हा सेट',
    category: 'Khana Bnane Ka Saman',
    pricePerDay: 2200,
    description: 'सब्जी, पुलाव, दाल व हलवा बनाने हेतु 2 बड़ी एल्युमिनियम देग, डबल बर्नर गैस भट्टी व पाइप।',
    unit: 'भट्टी + देग सेट / दिन',
    iconName: 'Flame'
  },
  {
    id: 'addon-k2',
    name: 'Badi Lohe & Peetal Ki Kadahi, Chamcha, Palta & Jhanjhar',
    hindiName: 'बड़ी हलवाई कड़ाही (30kg & 50kg) + पलटा, झांझर, चमचा सेट',
    category: 'Khana Bnane Ka Saman',
    pricePerDay: 1000,
    description: 'पूरी, कचौड़ी, जलेबी व मिठाई तलने के लिए भारी लोहे की कड़ाही और लंबे हैंडल वाले हलवाई औजार।',
    unit: 'कड़ाही व औजार सेट / दिन',
    iconName: 'Utensils'
  },
  {
    id: 'addon-k3',
    name: 'Stainless Steel Thali, Katori, Chamach & Glass (100 Sets)',
    hindiName: 'स्टील की 5-खाने वाली थाली, कटोरी, चम्मच व गिलास (100 सेट)',
    category: 'Khana Bnane Ka Saman',
    pricePerDay: 1800,
    description: 'साफ और चमचमाते 100 स्टील थाली सेट - पंगत व बुफे दोनों के लिए उपयुक्त।',
    unit: '100 सेट / दिन',
    iconName: 'UtensilsCrossed'
  },
  {
    id: 'addon-k4',
    name: 'Badi Balti, Jag, Donga & Khana Serving Drum Set',
    hindiName: 'स्टील बाल्टी (6 पीस), जग (10 पीस), डोंगा व दाल ड्रम',
    category: 'Khana Bnane Ka Saman',
    pricePerDay: 850,
    description: 'पंगत में दाल, सब्जी, पूरी परोसने के लिए मजबूत स्टील की बाल्टियां, डोंगे व जग।',
    unit: 'सर्विंग सेट / दिन',
    iconName: 'Package'
  },
  {
    id: 'addon-k5',
    name: 'Bada Roti Tawa, Aata Paraat & Belan Chauki Set',
    hindiName: 'बड़ा रोटी तवा (लोहे का) + 2 बड़ी पीतल परात + 4 बेलन चौकी',
    category: 'Khana Bnane Ka Saman',
    pricePerDay: 700,
    description: 'तवा रोटी, नान व आटा गूंथने के लिए हलवाई साइज परात और तवा।',
    unit: 'रोटी मेकिंग सेट / दिन',
    iconName: 'Circle'
  },
  {
    id: 'addon-k6',
    name: 'Cold Water Camper (20L x 5) & 500L Storage Tanki',
    hindiName: 'ठंडे पानी का वाटर कैम्पर (5 पीस) + 500 लीटर पानी टंकी',
    category: 'Khana Bnane Ka Saman',
    pricePerDay: 900,
    description: 'पीने के पानी और हलवाई के उपयोग हेतु इंसुलेटेड वाटर कैम्पर और बड़ी पानी की टंकी।',
    unit: 'वाटर सेट / दिन',
    iconName: 'Droplet'
  },
  {
    id: 'addon-k7',
    name: 'Buffet Service Counter Tables with Frill & Chafing Dish (4 Sets)',
    hindiName: 'बुफे काउंटर टेबल (झालर सहित) + 4 गर्म खाना रखने की डिश',
    category: 'Khana Bnane Ka Saman',
    pricePerDay: 2000,
    description: 'सजावटी झालर वाली 6 बुफे टेबल और खाना गर्म रखने वाली स्टेनलेस स्टील चाफिंग डिश।',
    unit: 'बुफे सेट / दिन',
    iconName: 'Table'
  },

  // --- 4. BIJLI & GENERATOR (बिजली व्यवस्था) ---
  {
    id: 'addon-g1',
    name: 'Silent Diesel Generator 7.5 kVA (Auto-Start + Backup)',
    hindiName: 'साइलेंट डीजल जनरेटर 7.5 kVA (लाइट, साउंड व कूलर लोड हेतु)',
    category: 'Bijli & Generator',
    pricePerDay: 2500,
    description: 'शादी, तिलक व रात्रि कार्यक्रम में बिना रुकावट बिजली आपूर्ति हेतु ऑपरेटर सहित।',
    unit: 'प्रति दिन (ऑपरेटर सहित)',
    iconName: 'Zap'
  },
  {
    id: 'addon-g2',
    name: 'Heavy 15 kVA Commercial Generator (Full Pandal + AC Load)',
    hindiName: 'हैवी 15 kVA जनरेटर (बड़े पंडाल, हैलोजन व पूरे लॉन लोड हेतु)',
    category: 'Bijli & Generator',
    pricePerDay: 4500,
    description: 'बड़े विवाह समारोह, बारात व विशाल पंडाल के संपूर्ण बिजली लोड हेतु।',
    unit: 'प्रति दिन (ऑपरेटर सहित)',
    iconName: 'Zap'
  },

  // --- 5. GARMIYON KA SAMAN (गर्मियों के लिए खास सामान) ---
  {
    id: 'addon-summer-1',
    name: 'High Speed Farrata Fan (Heavy Copper Stand Fan)',
    hindiName: 'हाई-स्पीड फर्राटा पंखा (मजबूत कॉपर वाइंडिंग स्टैंड फैन)',
    category: 'Garmiyon Ka Saman',
    pricePerDay: 150,
    description: 'तेज हवादार 2800 RPM हेवी-ड्यूटी 3-ब्लेड फर्राटा पंखा, लोहे की जाली, ऑसिलेशन व मजबूत स्टैंड सहित।',
    unit: '1 पंखा / दिन',
    iconName: 'Wind'
  },
  {
    id: 'addon-summer-2',
    name: 'Jumbo Commercial Desert Air Cooler (Heavy Honeycomb)',
    hindiName: 'जंबो डेजर्ट / कमर्शियल कूलर (120L पानी टंकी व हैवी पैड)',
    category: 'Garmiyon Ka Saman',
    pricePerDay: 450,
    description: 'बड़े पंडाल व हॉल के लिए शक्तिशाली जंबो कूलर, 120 लीटर वाटर टैंक, हनीकॉम्ब पैड व तेज हवा थ्रो के साथ।',
    unit: '1 कूलर / दिन',
    iconName: 'Snowflake'
  },
  {
    id: 'addon-summer-3',
    name: 'Insulated Cold Water Camper (20L Capacity with Tap)',
    hindiName: 'इंसुलेटेड ठंडा पानी कैंपर (20 लीटर क्षमता, मजबूत टैप सहित)',
    category: 'Garmiyon Ka Saman',
    pricePerDay: 80,
    description: 'बर्फ व ठंडे पानी को पूरे दिन चिल्ड रखने वाला मजबूत 20 लीटर फूड-ग्रेड इंसुलेटेड वाटर डिस्पेंसर कैंपर।',
    unit: '1 कैंपर / दिन',
    iconName: 'Droplet'
  },
  {
    id: 'addon-summer-4',
    name: 'Heavy Insulated Ice Storage Cooling Drum (100L)',
    hindiName: 'बर्फ रखने का बड़ा इंसुलेटेड ड्रम (Ice Cooling Drum - 100L)',
    category: 'Garmiyon Ka Saman',
    pricePerDay: 250,
    description: 'कोल्ड ड्रिंक्स, बोतलें, पानी व कैटरिंग की बर्फ को पिघलने से बचाने वाला बड़ा डबल-लेयर इंसुलेटेड आइस ड्रम।',
    unit: '1 ड्रम / दिन',
    iconName: 'Box'
  },

  // --- 6. SARDIYON KA SAMAN (सर्दियों के लिए खास सामान) ---
  {
    id: 'addon-winter-1',
    name: 'Windbreak Side Kanat & Thick Curtains (4 Pieces Set)',
    hindiName: 'हवा व ठंड रोकने वाली मोटी कनात व परदे (विंटर कनात सेट)',
    category: 'Sardiyon Ka Saman',
    pricePerDay: 500,
    description: 'सर्दियों की ठंडी हवा और ओस से बचाने के लिए 4 मोटी सूती विंटर कनात और सुरक्षित साइड पर्दे।',
    unit: '4 कनात सेट / दिन',
    iconName: 'Layers'
  },
  {
    id: 'addon-winter-2',
    name: 'Heavy Duty Room & Stage Halogen / Blower Heater (2000W)',
    hindiName: 'कमरा व स्टेज हैलोजन / ब्लोअर हीटर (2000W हेवी-ड्यूटी)',
    category: 'Sardiyon Ka Saman',
    pricePerDay: 350,
    description: 'दूल्हा-दुल्हन स्टेज, जनवासा व वीआईपी रूम के लिए 2000W शक्तिशाली रूम हीटर व हैलोजन रॉड।',
    unit: '1 हीटर / दिन',
    iconName: 'Flame'
  },
  {
    id: 'addon-winter-3',
    name: 'Traditional Brass / Iron Sigdi & Angithi with Stand',
    hindiName: 'कोयले वाली देसी पीतल/लोहे की सिगड़ी (अंगीठी व स्टैंड सहित)',
    category: 'Sardiyon Ka Saman',
    pricePerDay: 200,
    description: 'खुले पंडाल, अलाव व जनवासे में हाथ तापने हेतु जालीदार सुरक्षित लोहे/पीतल की सिगड़ी अंगीठी।',
    unit: '1 सिगड़ी / दिन',
    iconName: 'Flame'
  },
  {
    id: 'addon-winter-4',
    name: 'Extra Heavy Winter Quilt, Mattress & Pillow Set (5 Sets)',
    hindiName: 'एक्स्ट्रा रजाई-गद्दे, तकिया व गरम चादर सेट (5 सेट)',
    category: 'Sardiyon Ka Saman',
    pricePerDay: 800,
    description: 'कड़ाके की सर्दी में जनवासा व बारात के ठहरने हेतु भारी रुई की रजाई, मोटा गद्दा, तकिया व चादर।',
    unit: '5 सेट / दिन',
    iconName: 'Bed'
  },
  {
    id: 'addon-winter-5',
    name: 'Heavy Velvet / Woolen Floor Carpet & Runners (200 sq ft)',
    hindiName: 'जमीन की ठंडक रोकने वाले मोटे कालीन (मोटा वेलवेट कारपेट - 200 sq ft)',
    category: 'Sardiyon Ka Saman',
    pricePerDay: 600,
    description: 'कच्ची जमीन व फर्श की नमी और ठंड रोकने के लिए मोटा व मुलायम वेलवेट फ्लोर कालीन।',
    unit: '200 sq ft / दिन',
    iconName: 'Grid'
  },

  // --- 7. BARSAT KA SAMAN (बरसात के लिए खास सामान) ---
  {
    id: 'addon-rain-1',
    name: '100% Waterproof Heavy Silpaulin Tarpaulin (30x20 ft)',
    hindiName: '100% वाटरप्रूफ हैवी तिरपाल (Silpaulin Tarpaulin - 30x20 ft)',
    category: 'Barsat Ka Saman',
    pricePerDay: 700,
    description: 'मूसलाधार बारिश से टेंट, जनवासा व हलवाई भट्टी को पूरी तरह सूखा रखने वाली मजबूत सिलपॉलिन वाटरप्रूफ तिरपाल।',
    unit: '1 बड़ी तिरपाल / दिन',
    iconName: 'Shield'
  },
  {
    id: 'addon-rain-2',
    name: 'Raised Wooden / Iron Takht Platform (Waterproof Chowki - 2 Pieces)',
    hindiName: 'ऊंचाई वाले लकड़ी / लोहे के तख्त (कीचड़-पानी से सुरक्षा चौकी - 2 पीस)',
    category: 'Barsat Ka Saman',
    pricePerDay: 500,
    description: 'बरसात में जमीन के पानी व कीचड़ से सामान, गद्दे व खाने की सामग्री को ऊपर सुरक्षित रखने हेतु 6x4 फीट ऊंचा तख्त।',
    unit: '2 तख्त / दिन',
    iconName: 'Box'
  },

  // --- 8. SAF-SAFAI KA SAMAN (साफ-सफाई व हाइजीन का सामान) ---
  {
    id: 'addon-sanitation-1',
    name: 'Portable Handwash Washbasin Station (Foot Pump / Tap + Soap Stand)',
    hindiName: 'पोर्टेबल वॉशबेसिन (नल, सोप स्टैंड व वेस्ट वाटर पाइप सहित)',
    category: 'Saf-Safai Ka Saman',
    pricePerDay: 600,
    description: 'पंगत व बुफे डाइनिंग एरिया के पास हाथ धोने के लिए साफ पोर्टेबल वॉशबेसिन, नल, साबुन स्टैंड व ड्रेन पाइप।',
    unit: '1 बेसिन यूनिट / दिन',
    iconName: 'Droplet'
  },
  {
    id: 'addon-sanitation-2',
    name: 'Large Commercial Garbage Dustbins with Lid & Stand (4 Pieces)',
    hindiName: 'बड़े कमर्शियल कचरा डिब्बे (100L Heavy Dustbins with Lid - 4 पीस)',
    category: 'Saf-Safai Ka Saman',
    pricePerDay: 300,
    description: 'पत्तल, दोना, डिस्पोजल व कचरा इकट्ठा करने हेतु ढक्कनदार बड़े प्लास्टिक डस्टबिन व स्टैंड (4 पीस)।',
    unit: '4 डिब्बे सेट / दिन',
    iconName: 'Trash2'
  }
];

export const INITIAL_TENTS: Tent[] = [
  {
    id: 'tent-1',
    name: 'Desi Shamyana Pandal (Traditional Red & Yellow Canopy)',
    hindiName: 'पारंपरिक लाल-पीला कनात व शामियाना पंडाल',
    category: 'Desi Shamyana Pandal',
    description: 'गांव-देहात, तिलक, शादी, भागवत कथा, मुंडन व भोज के लिए सबसे लोकप्रिय मजबूत कनात व शामियाना टेंट। चारों तरफ से सुंदर प्रिंटेड कनात, बांस-बल्ली की मजबूत फिटिंग और हवादार व्यवस्था।',
    detailedSpecs: {
      dimensions: '30ft x 60ft (1,800 sq ft)',
      capacitySeated: 150,
      capacityStanding: 250,
      peakHeight: '14 ft Apex',
      setupTime: '2 - 3 घंटे (अनुभवी टेंट कारीगरों द्वारा)',
      waterproofRating: 'मजबूत सूती व वॉटर-रेसिस्टेंट डबल लेयर कनात',
      windResistance: 'मजबूत बांस-बल्ली, रस्सा व लोहे के खूंटे द्वारा सुरक्षित',
      frameMaterial: 'मजबूत लोहे के पोल, जीआई पाइप व बांस-बल्ली'
    },
    pricePerDay: 4500,
    weeklyDiscountPercentage: 15,
    depositAmount: 1500,
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      'पारंपरिक लाल, पीला और सफेद राजस्थानी/देसी झालर डिजाइन',
      'चारों तरफ कनात लगाने या खुला रखने की पूर्ण सुविधा',
      'पंगत (जमीन पर भोजन) व कुर्सी दोनों व्यवस्था के लिए उपयुक्त',
      'साफ-सुथरी धुली हुई कनात व छत का पर्दा'
    ],
    includedItems: [
      '30x60 फीट शामियाना छत पर्दा',
      'चारों तरफ की प्रिंटेड कनात (दीवारें)',
      'लोहे के पाइप/बांस-बल्ली, रस्सा व खूंटे',
      'कारीगरों द्वारा साइट पर संपूर्ण लगाना व खोलना'
    ],
    stockQuantity: 8,
    isFeatured: true,
    isPopular: true,
    status: 'Available',
    supportedSurfaces: ['Khet / Khula Ground', 'Lawn / Ghaas', 'Aangan / Pakka Farsh', 'Sadak / Gali'],
    rating: 4.94,
    reviewCount: 65,
    reviews: [
      {
        id: 'rev-1',
        userName: 'रामबाबू यादव (ग्राम रसूलपुर)',
        rating: 5,
        date: '18 अगस्त 2026',
        comment: 'बिटिया के तिलक और बारात के लिए शामियाना लगवाया था। समय पर पूरा टेंट और पंगत की दरी-चांदनी बिछा दी। बहुत बढ़िया काम।',
        eventType: 'तिलक व बारात समारोह'
      },
      {
        id: 'rev-2',
        userName: 'सुरेश प्रधान जी',
        rating: 5,
        date: '02 अगस्त 2026',
        comment: 'गांव के अखंड रामायण पाठ व भंडारे के लिए बुक किया था। कनात एकदम साफ और मजबूत थी।',
        eventType: 'धार्मिक कथा व भंडारा'
      }
    ]
  },
  {
    id: 'tent-2',
    name: 'Waterproof German Hanger Lawn Pandal (Heavy Rain/Wind Proof)',
    hindiName: 'वाटरप्रूफ जर्मन हैंगर व लॉन पंडाल (बारिश व आंधी रोधक)',
    category: 'Waterproof German Hanger Pandal',
    description: 'लॉन, फार्महाउस व खुले मैदान में भव्य शादी समारोह हेतु 100% वाटरप्रूफ जर्मन हैंगर स्ट्रक्चर। बीच में कोई खंभा नहीं, पूरा खुला स्पेस और बारिश-आंधी में पूरी तरह सुरक्षित।',
    detailedSpecs: {
      dimensions: '40ft x 80ft (3,200 sq ft)',
      capacitySeated: 300,
      capacityStanding: 500,
      peakHeight: '22 ft Apex',
      setupTime: '4 - 5 घंटे (हैवी स्ट्रक्चर रिगिंग टीम)',
      waterproofRating: '100% वाटरप्रूफ 850 GSM जर्मन पीवीसी शेड',
      windResistance: '70 mph तक तेज आंधी व तूफान रोधक',
      frameMaterial: 'हैवी ड्यूटी एनोडाइज्ड एल्युमिनियम ट्रस्ट व जीआई पोल'
    },
    pricePerDay: 16000,
    weeklyDiscountPercentage: 20,
    depositAmount: 5000,
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      'अंदर कोई बीच का खंभा नहीं - 100% खुला और निर्बाध हॉल',
      'मूसलाधार बारिश और तेज हवा में भी पूर्ण वाटरप्रूफ सुरक्षा',
      'झूमर, एसी व फैंसी लाइटिंग लगाने के लिए मजबूत ट्रस्ट',
      'प्रीमियम सफेद व खिड़की वाली साइड कनात'
    ],
    includedItems: [
      'एल्युमिनियम जर्मन हैंगर फ्रेमवर्क',
      'वाटरप्रूफ व्हाइट पीवीसी रूफ शेड',
      'चारों तरफ वेदरप्रूफ साइड कनात',
      'हैवी ग्राउंड एंकर व क्लैंप'
    ],
    stockQuantity: 4,
    isFeatured: true,
    isPopular: true,
    status: 'Available',
    supportedSurfaces: ['Lawn / Ghaas', 'Khet / Khula Ground', 'Aangan / Pakka Farsh'],
    rating: 4.98,
    reviewCount: 48,
    reviews: [
      {
        id: 'rev-3',
        userName: 'दिनेश सिंह (फार्महाउस ओनर)',
        rating: 5,
        date: '10 जुलाई 2026',
        comment: 'बरसात के मौसम में शादी थी, लेकिन जर्मन हैंगर की वजह से एक बूंद पानी अंदर नहीं आया। सब मेहमान तारीफ कर रहे थे।',
        eventType: 'भव्य विवाह रिसेप्शन'
      }
    ]
  },
  {
    id: 'tent-3',
    name: 'Wedding Mandap & Stage Canopy (Royal Vivah Setup)',
    hindiName: 'विवाह मंडप, जयमाल व फेरे टेंट सेटअप',
    category: 'Wedding Mandap & Stage Tent',
    description: 'शादी के फेरे, पूजा-हवन, जयमाल स्टेज व सिंदूरदान की रस्म हेतु विशेष 4-पिलर रॉयल मंडप टेंट। खूबसूरत कपड़े की ड्रेपिंग, कलश व हवन कुंड एरिया सहित।',
    detailedSpecs: {
      dimensions: '20ft x 20ft (400 sq ft)',
      capacitySeated: 40,
      capacityStanding: 70,
      peakHeight: '14 ft Peak',
      setupTime: '2 घंटे',
      waterproofRating: 'वॉटर-शील्ड कैनोपी व साटन ड्रेपिंग',
      windResistance: '45 mph हवा रोधक',
      frameMaterial: 'रॉयल गोल्डन / व्हाइट स्टील पाइप व नक्काशीदार पिलर'
    },
    pricePerDay: 5500,
    weeklyDiscountPercentage: 15,
    depositAmount: 2000,
    images: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      '4 नक्काशीदार खंभे व कलश स्टाइल टॉप',
      'हवन कुंड, पंडित जी की चौकी व फेरे के लिए खुला सेंटर',
      'रॉयल साटन व नेट ड्रेपिंग (लाल, पीला व गोल्डन थीम)',
      'पंडाल के अंदर या खुले लॉन/आंगन में आसानी से फिट'
    ],
    includedItems: [
      'मंडप स्ट्रक्चर व 4 पिलर',
      'कलरफुल साटन ड्रेपिंग व सीलिंग',
      'पंडित जी की पूजा चौकी व हवन बेस',
      'लाइटिंग पॉइंट कनेक्शन'
    ],
    stockQuantity: 6,
    isFeatured: true,
    isPopular: true,
    status: 'Available',
    supportedSurfaces: ['Aangan / Pakka Farsh', 'Lawn / Ghaas', 'Chhat / Terrace', 'Khet / Khula Ground'],
    rating: 4.92,
    reviewCount: 41,
    reviews: [
      {
        id: 'rev-4',
        userName: 'पंडित उमाकांत शास्त्री',
        rating: 5,
        date: '25 जुलाई 2026',
        comment: 'फेरे और पूजा के लिए एकदम उत्तम मंडप व्यवस्था। धुआं निकलने की भी अच्छी व्यवस्था थी।',
        eventType: 'विवाह फेरे व पूजा'
      }
    ]
  },
  {
    id: 'tent-4',
    name: 'Haldi & Mehendi Yellow Canopy (Marigold Vibe Pandal)',
    hindiName: 'हल्दी व मेहंदी पीला शामियाना (गेंदा फूल थीम)',
    category: 'Haldi & Mehendi Yellow Canopy',
    description: 'हल्दी, मेहंदी, संगीत व महिला संगीत के लिए चमकीला पीला व नारंगी थीम शामियाना। गेंदा लड़ी, झूले की सजावट व फोटो बैकड्रॉप के साथ अत्यंत मनमोहक।',
    detailedSpecs: {
      dimensions: '20ft x 30ft (600 sq ft)',
      capacitySeated: 60,
      capacityStanding: 90,
      peakHeight: '12 ft Peak',
      setupTime: '1.5 घंटे',
      waterproofRating: 'सन-शेड व लाइट रेन प्रूफ',
      windResistance: '40 mph हवा रोधक',
      frameMaterial: 'मजबूत जीआई फ्रेम व साइड पोल'
    },
    pricePerDay: 4000,
    weeklyDiscountPercentage: 15,
    depositAmount: 1500,
    images: [
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      'चमकीला पीला व नारंगी ड्रेप फैब्रिक',
      'हल्दी रस्म हेतु विशेष बैठने की चौकी व बैकड्रॉप',
      'धूप से 100% छाया व दिन के कार्यक्रम के लिए परफेक्ट',
      'गांव के दालान, आंगन व लॉन में आसानी से लगने योग्य'
    ],
    includedItems: [
      '20x30 फीट येलो कैनोपी स्ट्रक्चर',
      'गेंदा फूल थीम वाली साइड कनात',
      'हल्दी रस्म सीटिंग स्टेज बेस',
      'कारपेट व फर्श चांदनी'
    ],
    stockQuantity: 10,
    isFeatured: false,
    isPopular: true,
    status: 'Available',
    supportedSurfaces: ['Aangan / Pakka Farsh', 'Lawn / Ghaas', 'Chhat / Terrace', 'Khet / Khula Ground'],
    rating: 4.90,
    reviewCount: 39,
    reviews: [
      {
        id: 'rev-5',
        userName: 'संगीता देवी (मऊ)',
        rating: 5,
        date: '05 अगस्त 2026',
        comment: 'हल्दी के फंक्शन में फोटो बहुत सुंदर आई। पीला टेंट और सजावट बहुत प्यारी लगी।',
        eventType: 'हल्दी व मेहंदी रस्म'
      }
    ]
  },
  {
    id: 'tent-5',
    name: 'Bhojan & Pangat Shamyana (Halwai Cooking & Dining Tent)',
    hindiName: 'भोजन व पंगत शामियाना (हलवाई भट्टी व खान-पान टेंट)',
    category: 'Bhojan & Pangat Shamyana',
    description: 'हलवाई की भट्टी लगाने, भोजन बनाने और मेहमानों की पंगत बैठाने के लिए लंबा व चौड़ा हवादार शामियाना। धुएं की निकासी व बर्तनों की धुलाई एरिया की विशेष व्यवस्था।',
    detailedSpecs: {
      dimensions: '25ft x 70ft (1,750 sq ft)',
      capacitySeated: 180,
      capacityStanding: 300,
      peakHeight: '15 ft Apex',
      setupTime: '2 - 3 घंटे',
      waterproofRating: 'फायर-रेसिस्टेंट टॉप शेड व डस्ट प्रूफ कनात',
      windResistance: '50 mph हवा रोधक',
      frameMaterial: 'हैवी लोहे के पाइप व मजबूत सपोर्टिंग पोल'
    },
    pricePerDay: 4800,
    weeklyDiscountPercentage: 15,
    depositAmount: 1500,
    images: [
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      'भोजन पंगत के लिए दो लंबी कतारें लगाने की पूरी जगह',
      'एक तरफ हलवाई भट्टी और स्टोर के लिए अलग कनात पार्टीशन',
      'धूल-मिट्टी से बचाव के लिए ऊंची साइड कनात',
      'सर्विस टेबल व वाटर ड्रम रखने की विशेष जगह'
    ],
    includedItems: [
      '25x70 फीट शामियाना रूफ',
      'पार्टीशन कनात (हलवाई सेक्शन)',
      'पंगत के लिए 6 लंबी दरियां',
      'फिक्सिंग पाइप व मजबूत रस्से'
    ],
    stockQuantity: 7,
    isFeatured: false,
    isPopular: true,
    status: 'Available',
    supportedSurfaces: ['Khet / Khula Ground', 'Lawn / Ghaas', 'Sadak / Gali', 'Aangan / Pakka Farsh'],
    rating: 4.88,
    reviewCount: 52,
    reviews: [
      {
        id: 'rev-6',
        userName: 'सुरेंद्र कुमार (हलवाई संघ)',
        rating: 5,
        date: '28 जुलाई 2026',
        comment: 'भट्टी लगाने और पंगत बैठाने के लिए यह टेंट सबसे सही है। धुआं आसानी से निकल जाता है।',
        eventType: 'विशाल प्रीतिभोज'
      }
    ]
  },
  {
    id: 'tent-6',
    name: 'VIP Lawn Marquee (White Gazebo for Farmhouse / Lawn Parties)',
    hindiName: 'वीआईपी लॉन मार्की (व्हाइट शामियाना फॉर लॉन व बगीचा)',
    category: 'VIP Lawn Marquee',
    description: 'फार्महाउस, रिसॉर्ट व वीआईपी लॉन में हाई-प्रोफाइल रिसेप्शन, बर्थडे व कॉकटेल पार्टी हेतु एलिगेंट व्हाइट कैनोपी टेंट। फ्रेंच विंडो कनात व आकर्षक झालर सहित।',
    detailedSpecs: {
      dimensions: '30ft x 50ft (1,500 sq ft)',
      capacitySeated: 120,
      capacityStanding: 200,
      peakHeight: '16 ft Apex',
      setupTime: '2.5 घंटे',
      waterproofRating: '100% वाटरप्रूफ व यूवी प्रोटेक्टेड पीवीसी',
      windResistance: '55 mph हवा रोधक',
      frameMaterial: 'व्हाइट पाउडर-कोटेड हेवी स्ट्रक्चरल एल्युमिनियम'
    },
    pricePerDay: 9500,
    weeklyDiscountPercentage: 15,
    depositAmount: 3000,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      'रॉयल व्हाइट कैनोपी व पारदर्शी फ्रेंच विंडो साइडवॉल्स',
      'घास या फर्श को बिना नुकसान पहुंचाए सेफ ग्राउंड बेस',
      'फानूस, झूमर व एसी डक्ट लगाने योग्य',
      'मॉडर्न लुक व प्रीमियम फिनिशिंग'
    ],
    includedItems: [
      'एल्युमिनियम फ्रेम व व्हाइट कैनोपी',
      'फ्रेंच विंडो साइड कनात सेट',
      'ग्राउंड वेट्स व एंकरिंग किट',
      'एलईडी पेरिफेरल वार्म लाइट'
    ],
    stockQuantity: 5,
    isFeatured: true,
    isPopular: false,
    status: 'Available',
    supportedSurfaces: ['Lawn / Ghaas', 'Aangan / Pakka Farsh', 'Chhat / Terrace', 'Khet / Khula Ground'],
    rating: 4.96,
    reviewCount: 29,
    reviews: [
      {
        id: 'rev-7',
        userName: 'डॉ. विक्रम सिंह',
        rating: 5,
        date: '14 अगस्त 2026',
        comment: 'फार्महाउस पर एनिवर्सरी पार्टी के लिए लिया था। बहुत ही क्लासी और सुंदर लगा।',
        eventType: 'फार्महाउस फैमिली पार्टी'
      }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    bookingNumber: 'TH-94821',
    createdAt: '2026-08-20T10:30:00Z',
    customerName: 'राजेश यादव (प्रधान जी)',
    customerEmail: 'rajesh.yadav@example.com',
    customerPhone: '+91 8418067579',
    tentId: 'tent-1',
    tentName: 'पारंपरिक लाल-पीला कनात व शामियाना पंडाल',
    tentImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    tentCategory: 'Desi Shamyana Pandal',
    startDate: '2026-09-12',
    endDate: '2026-09-14',
    totalDays: 2,
    guestCount: 250,
    eventType: 'विवाह व बारात समारोह',
    villageOrCity: 'ग्राम रसूलपुर, पोस्ट शिवपुर',
    gramPanchayatOrArea: 'रसूलपुर ग्राम पंचायत',
    district: 'वाराणसी / जौनपुर बॉर्डर',
    landmark: 'प्राथमिक विद्यालय के पास',
    deliveryAddress: 'यादव भवन, ग्राम रसूलपुर, पोस्ट शिवपुर',
    surfaceType: 'Khet / Khula Ground',
    addons: [
      { addonId: 'addon-b1', name: 'गद्दा, रजाई, तकिया व गोल मसनद सेट (10 सेट)', category: 'Baithne Ka Saman', pricePerDay: 1200, unit: '10 सेट / दिन', quantity: 2 },
      { addonId: 'addon-b2', name: 'नीलकमल वीआईपी कुर्सी (50 कुर्सियां)', category: 'Baithne Ka Saman', pricePerDay: 1500, unit: '50 कुर्सी सेट / दिन', quantity: 2 },
      { addonId: 'addon-k1', name: 'बड़ी देग + हलवाई डबल भट्टी चूल्हा सेट', category: 'Khana Bnane Ka Saman', pricePerDay: 2200, unit: 'भट्टी + देग सेट / दिन', quantity: 1 },
      { addonId: 'addon-g1', name: 'साइलेंट डीजल जनरेटर 7.5 kVA', category: 'Bijli & Generator', pricePerDay: 2500, unit: 'प्रति दिन', quantity: 1 }
    ],
    specialInstructions: 'शुक्रवार सुबह 10 बजे तक टेंट और जनवासे का गद्दा-रजाई तैयार होना चाहिए। भट्टी पीछे खेत वाले हिस्से में लगेगी।',
    baseRentTotal: 9000,
    addonsTotal: 20200,
    transportSetupFee: 1200,
    taxAmount: 0,
    securityDeposit: 2000,
    grandTotal: 32400,
    paymentPlan: '3_INSTALLMENTS',
    paidAmount: 32400,
    balanceAmount: 0,
    installments: [
      { id: 'inst-101-1', stage: 'advance', titleHindi: '1. साई / बयाना (Booking Token)', scheduledAmount: 8000, paidAmount: 8000, dueDateDescription: 'बुकिंग दर्ज करते समय', paidDate: '2026-08-20', status: 'Paid', paymentMode: 'UPI / PhonePe / GPay', receiptNote: 'बुकिंग कन्फर्मेशन साई प्राप्त हुई' },
      { id: 'inst-101-2', stage: 'setup', titleHindi: '2. टेंट लगने पर (On Setup / Event Day)', scheduledAmount: 16000, paidAmount: 16000, dueDateDescription: 'सामान व टेंट ग्राउंड पर लगने पर', paidDate: '2026-08-21', status: 'Paid', paymentMode: 'Cash (नकद)', receiptNote: 'टेंट व जनरेटर चालू होने पर प्राप्त' },
      { id: 'inst-101-3', stage: 'post_event', titleHindi: '3. सामान उतरने / विदाई बाद (Final Settlement)', scheduledAmount: 8400, paidAmount: 8400, dueDateDescription: 'कार्यक्रम समाप्ति व सामान गिनती बाद', paidDate: '2026-08-22', status: 'Paid', paymentMode: 'Cash (नकद)', receiptNote: 'पूरा हिसाब चुकता' }
    ],
    status: 'Confirmed',
    paymentStatus: 'Full Paid',
    paymentMethod: 'UPI / PhonePe / GPay',
    assignedCrew: 'टेंटहाउस टीम 1 (लीड: करन यादव)'
  },
  {
    id: 'bk-102',
    bookingNumber: 'TH-94822',
    createdAt: '2026-08-22T14:15:00Z',
    customerName: 'अमित कुमार सिंह',
    customerEmail: 'amit.singh@gmail.com',
    customerPhone: '+91 9820012345',
    tentId: 'tent-2',
    tentName: 'वाटरप्रूफ जर्मन हैंगर व लॉन पंडाल',
    tentImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    tentCategory: 'Waterproof German Hanger Pandal',
    startDate: '2026-09-25',
    endDate: '2026-09-27',
    totalDays: 2,
    guestCount: 400,
    eventType: 'जयमाल व विवाह रिसेप्शन',
    villageOrCity: 'ग्रीन मीडोज लॉन व फार्महाउस',
    gramPanchayatOrArea: 'बायपास रोड',
    district: 'लखनऊ / बाराबंकी रोड',
    landmark: 'पेट्रोल पंप के ठीक पीछे',
    deliveryAddress: 'प्लॉट न. 44, ग्रीन मीडोज लॉन, बायपास रोड',
    surfaceType: 'Lawn / Ghaas',
    addons: [
      { addonId: 'addon-b3', name: 'महाराजा दूल्हा-दुल्हन सोफा व जयमाल स्टेज चेयर', category: 'Baithne Ka Saman', pricePerDay: 2500, unit: '1 सोफा सेट / दिन', quantity: 1 },
      { addonId: 'addon-s1', name: 'जयमाल स्टेज व विवाह मंडप ताजे फूल सजावट', category: 'Sajane Ka Saman', pricePerDay: 4500, unit: 'पूरा स्टेज डेकोर / दिन', quantity: 1 },
      { addonId: 'addon-k3', name: 'स्टील की 5-खाने वाली थाली, कटोरी, चम्मच (100 सेट)', category: 'Khana Bnane Ka Saman', pricePerDay: 1800, unit: '100 सेट / दिन', quantity: 3 }
    ],
    specialInstructions: 'स्टेज की फूल सजावट और कालीन शाम 4 बजे से पहले कम्पलीट चाहिए।',
    baseRentTotal: 32000,
    addonsTotal: 24800,
    transportSetupFee: 1500,
    taxAmount: 0,
    securityDeposit: 5000,
    grandTotal: 63300,
    paymentPlan: '3_INSTALLMENTS',
    paidAmount: 15000,
    balanceAmount: 48300,
    installments: [
      { id: 'inst-102-1', stage: 'advance', titleHindi: '1. साई / बयाना (Booking Token)', scheduledAmount: 15000, paidAmount: 15000, dueDateDescription: 'बुकिंग दर्ज करते समय', paidDate: '2026-08-22', status: 'Paid', paymentMode: 'UPI / PhonePe / GPay', receiptNote: 'एडवांस बयाना प्राप्त' },
      { id: 'inst-102-2', stage: 'setup', titleHindi: '2. टेंट लगने पर (On Setup / Event Day)', scheduledAmount: 30000, paidAmount: 0, dueDateDescription: '25 सितम्बर - जर्मन हैंगर व स्टेज तैयार होने पर', status: 'Pending' },
      { id: 'inst-102-3', stage: 'post_event', titleHindi: '3. सामान उतरने / विदाई बाद (Final Settlement)', scheduledAmount: 18300, paidAmount: 0, dueDateDescription: '27 सितम्बर - रिसेप्शन समाप्ति पर बाकी भुगतान', status: 'Pending' }
    ],
    status: 'Pending',
    paymentStatus: 'Advance Paid',
    paymentMethod: 'UPI / PhonePe / GPay'
  },
  {
    id: 'bk-103',
    bookingNumber: 'TH-94823',
    createdAt: '2026-08-23T09:00:00Z',
    customerName: 'पूनम देवी',
    customerEmail: 'poonam.devi@gmail.com',
    customerPhone: '+91 9415099887',
    tentId: 'tent-4',
    tentName: 'हल्दी व मेहंदी पीला शामियाना',
    tentImage: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80',
    tentCategory: 'Haldi & Mehendi Yellow Canopy',
    startDate: '2026-08-30',
    endDate: '2026-08-31',
    totalDays: 1,
    guestCount: 80,
    eventType: 'हल्दी व संगीत रस्म',
    villageOrCity: 'ग्राम रामपुर बुजुर्ग',
    gramPanchayatOrArea: 'रामपुर पंचायत',
    district: 'गाजीपुर',
    landmark: 'बड़े हनुमान मंदिर के सामने',
    deliveryAddress: 'चौधरी निवास, रामपुर बुजुर्ग',
    surfaceType: 'Aangan / Pakka Farsh',
    addons: [
      { addonId: 'addon-s3', name: 'एलईडी झालर लड़ी + हैलोजन + झूमर', category: 'Lighting & Sound', pricePerDay: 1800, unit: 'पूरा लाइट सेट / दिन', quantity: 1 },
      { addonId: 'addon-s4', name: 'डीजे साउंड बॉक्स + 2 वायरलेस माइक', category: 'Lighting & Sound', pricePerDay: 3000, unit: 'साउंड सेट / दिन', quantity: 1 }
    ],
    specialInstructions: 'आंगन में पीला टेंट लगेगा और साउंड बॉक्स महिला संगीत के लिए तैयार रखना है।',
    baseRentTotal: 4000,
    addonsTotal: 4800,
    transportSetupFee: 800,
    taxAmount: 0,
    securityDeposit: 1500,
    grandTotal: 11100,
    paymentPlan: '2_INSTALLMENTS',
    paidAmount: 3000,
    balanceAmount: 8100,
    installments: [
      { id: 'inst-103-1', stage: 'advance', titleHindi: '1. साई / बयाना (Booking Token)', scheduledAmount: 3000, paidAmount: 3000, dueDateDescription: 'बुकिंग दर्ज करते समय', paidDate: '2026-08-23', status: 'Paid', paymentMode: 'Cash (नकद)', receiptNote: 'हाथ में बयाना दिया' },
      { id: 'inst-103-2', stage: 'setup', titleHindi: '2. टेंट लगने व कार्यक्रम के दिन (On Setup / Event Day)', scheduledAmount: 8100, paidAmount: 0, dueDateDescription: '30 अगस्त - शामियाना व साउंड लगाने पर', status: 'Pending' }
    ],
    status: 'Confirmed',
    paymentStatus: 'Advance Paid',
    paymentMethod: 'Cash on Setup (Advance Paid)',
    assignedCrew: 'टेंटहाउस टीम 2 (लीड: सचिन)'
  }
];
