/**
 * @description Greatly expanded data for states, districts, and their corresponding cities.
 * Structure: State > District > [City, City, ...]
 * Note: This is a comprehensive but not exhaustive list. In a production app,
 * this data would ideally be fetched from a server API for manageability.
 */
export const locations = {
    "Maharashtra": {
        "Ahmednagar": ["Ahmednagar", "Shrirampur", "Sangamner", "Kopargaon", "Rahuri", "Shevgaon", "Pathardi", "Jamkhed", "Karjat"],
        "Akola": ["Akola", "Akot", "Murtizapur", "Balapur", "Patur", "Telhara", "Risod"],
        "Amravati": ["Amravati", "Achalpur", "Anjangaon", "Warud", "Daryapur", "Morshi", "Chandur Bazar", "Dhamangaon Railway"],
        "Aurangabad": ["Aurangabad", "Paithan", "Sillod", "Vaijapur", "Gangapur", "Khuldabad", "Kannad", "Phulambri"],
        "Beed": ["Beed", "Ambajogai", "Parli", "Majalgaon", "Georai", "Kaij", "Ashti", "Wadwani"],
        "Bhandara": ["Bhandara", "Tumsar", "Pauni", "Sakoli", "Mohadi", "Lakhandur"],
        "Buldhana": ["Buldhana", "Khamgaon", "Malkapur", "Shegaon", "Jalgaon Jamod", "Chikhli", "Deulgaon Raja", "Mehkar"],
        "Chandrapur": ["Chandrapur", "Ballarpur", "Warora", "Bhadravati", "Rajura", "Korpana", "Chimur", "Gondpipri"],
        "Dhule": ["Dhule", "Shirpur", "Sakri", "Shindkheda", "Dondaicha-Warwade"],
        "Gadchiroli": ["Gadchiroli", "Aheri", "Desaiganj", "Armori", "Chamorshi", "Etapalli"],
        "Gondia": ["Gondia", "Tirora", "Deori", "Amgaon", "Arjuni Morgaon", "Goregaon"],
        "Hingoli": ["Hingoli", "Kalamnuri", "Basmath", "Sengaon", "Aundha Nagnath"],
        "Jalgaon": ["Jalgaon", "Bhusawal", "Chalisgaon", "Amalner", "Pachora", "Raver", "Faizpur", "Yawal", "Dharangaon"],
        "Jalna": ["Jalna", "Ambad", "Partur", "Bhokardan", "Badnapur", "Mantha"],
        "Kolhapur": ["Kolhapur", "Ichalkaranji", "Jaysingpur", "Gadhinglaj", "Kagal", "Panhala", "Radhanagari", "Shirol"],
        "Latur": ["Latur", "Udgir", "Ahmedpur", "Nilanga", "Ausa", "Chakur", "Renapur"],
        "Mumbai City": ["Mumbai"], // Mumbai City is typically treated as one large entity for districts
        "Mumbai Suburban": ["Bandra", "Andheri", "Borivali", "Kurla", "Dahisar", "Goregaon", "Juhu", "Malad", "Santacruz", "Vile Parle"],
        "Nagpur": ["Nagpur", "Kamthi", "Umred", "Katol", "Ramtek", "Saoner", "Hingna", "Narkhed", "Mouda"],
        "Nanded": ["Nanded", "Deglur", "Dharmabad", "Kinwat", "Mukhed", "Biloli", "Hadgaon", "Bhokar"],
        "Nandurbar": ["Nandurbar", "Shahada", "Taloda", "Navapur", "Akkalkuwa", "Dhadgaon"],
        "Nashik": ["Nashik", "Malegaon", "Manmad", "Sinnar", "Igatpuri", "Niphad", "Yeola", "Satana", "Chandwad"],
        "Osmanabad": ["Osmanabad", "Tuljapur", "Umarga", "Kallam", "Paranda", "Bhoom", "Lohara"],
        "Palghar": ["Palghar", "Vasai-Virar", "Dahanu", "Boisar", "Talasari", "Jawhar", "Mokhada"],
        "Parbhani": ["Parbhani", "Sailu", "Gangakhed", "Pathri", "Jintur", "Palam", "Sonpeth"],
        "Pune": ["Pune", "Pimpri-Chinchwad", "Baramati", "Junnar", "Lonavla", "Shirur", "Ambegaon", "Maval", "Daund", "Indapur"],
        "Raigad": ["Alibag", "Panvel", "Pen", "Mahad", "Karjat", "Khopoli", "Mangaon", "Roha", "Shrivardhan"],
        "Ratnagiri": ["Ratnagiri", "Chiplun", "Khed", "Dapoli", "Mandangad", "Guhagar", "Rajapur"],
        "Sangli": ["Sangli", "Miraj", "Islampur", "Vita", "Ashta", "Tasgaon", "Walwa", "Atpadi"],
        "Satara": ["Satara", "Karad", "Phaltan", "Wai", "Panchgani", "Mahabaleshwar", "Koregaon", "Patan"],
        "Sindhudurg": ["Sawantwadi", "Kankavli", "Kudal", "Vengurla", "Malvan", "Devgad", "Vaibhavwadi", "Dodamarg"],
        "Solapur": ["Solapur", "Pandharpur", "Barshi", "Akkalkot", "Mangalvedhe", "Mohol", "Karmala", "Madha"],
        "Thane": ["Thane", "Navi Mumbai", "Kalyan-Dombivli", "Ulhasnagar", "Bhiwandi", "Mira-Bhayandar", "Ambernath", "Badlapur"],
        "Wardha": ["Wardha", "Hinganghat", "Arvi", "Pulgaon", "Deoli", "Samudrapur"],
        "Washim": ["Washim", "Risod", "Karanja", "Malegaon", "Mangrulpir"],
        "Yavatmal": ["Yavatmal", "Wani", "Pusad", "Umarkhed", "Darwha", "Digras", "Ghatanji", "Ner"],
    },
    "Goa": {
        "North Goa": ["Panaji", "Mapusa", "Bicholim", "Pernem", "Valpoi", "Calangute", "Candolim", "Aldona", "Siolim", "Tivim", "Goa Velha", "Ponda (North Goa portion)"],
        "South Goa": ["Margao", "Vasco da Gama", "Ponda", "Quepem", "Canacona", "Curchorem", "Sanvordem", "Sanguem", "Cuncolim", "Navelim", "Benaulim"],
    },
    "Karnataka": {
        "Bagalkot": ["Bagalkot", "Jamkhandi", "Mudhol", "Badami"],
        "Ballari": ["Ballari", "Hospet", "Sandur", "Siruguppa"],
        "Belagavi": ["Belagavi", "Gokak", "Chikkodi", "Athani", "Nipani"],
        "Bengaluru Rural": ["Doddaballapur", "Devanahalli", "Hosakote", "Nelamangala"],
        "Bengaluru Urban": ["Bengaluru"],
        "Bidar": ["Bidar", "Basavakalyan", "Bhalki", "Humnabad"],
        "Chamarajanagar": ["Chamarajanagar", "Kollegal", "Gundlupet"],
        "Chikkaballapur": ["Chikkaballapur", "Gauribidanur", "Sidlaghatta"],
        "Chikkamagaluru": ["Chikkamagaluru", "Kadur", "Tarikere", "Sringeri"],
        "Chitradurga": ["Chitradurga", "Hiriyur", "Challakere"],
        "Dakshina Kannada": ["Mangaluru", "Puttur", "Bantwal", "Sullia"],
        "Davanagere": ["Davanagere", "Harihar", "Jagalur"],
        "Dharwad": ["Dharwad", "Hubballi", "Kalghatgi", "Kundgol"],
        "Gadag": ["Gadag", "Ron", "Nargund", "Shirahatti"],
        "Hassan": ["Hassan", "Arsikere", "Channarayapatna", "Holenarsipur", "Belur"],
        "Haveri": ["Haveri", "Ranebennur", "Byadgi", "Savanur"],
        "Kalaburagi": ["Kalaburagi", "Sedam", "Chittapur", "Aland"],
        "Kodagu": ["Madikeri", "Virajpet", "Somwarpet"],
        "Kolar": ["Kolar", "Bangarapet", "Malur", "Mulbagal"],
        "Koppal": ["Koppal", "Gangawati", "Kushtagi"],
        "Mandya": ["Mandya", "Maddur", "Malavalli", "Srirangapatna"],
        "Mysuru": ["Mysuru", "Nanjangud", "Hunsur", "Tirumakudalu Narasipura"],
        "Raichur": ["Raichur", "Manvi", "Sindhanur"],
        "Ramanagara": ["Ramanagara", "Channapatna", "Kanakapura", "Magadi"],
        "Shivamogga": ["Shivamogga", "Bhadravati", "Sagar", "Shikaripura"],
        "Tumakuru": ["Tumakuru", "Tiptur", "Sira", "Madhugiri"],
        "Udupi": ["Udupi", "Manipal", "Karkala", "Kundapura"],
        "Uttara Kannada": ["Karwar", "Sirsi", "Dandeli", "Gokarna", "Ankola"],
        "Vijayapura": ["Vijayapura", "Indi", "Basavana Bagevadi"],
        "Yadgir": ["Yadgir", "Shahapur", "Surapura"],
    },
    // "Uttar Pradesh": {
    //     "Agra": ["Agra", "Fatehpur Sikri", "Achhnera", "Etmadpur", "Tundla"],
    //     "Aligarh": ["Aligarh", "Atrauli", "Khair", "Iglas"],
    //     "Prayagraj": ["Prayagraj", "Phulpur", "Handia", "Naini"],
    //     "Ambedkar Nagar": ["Akbarpur", "Tanda", "Jalalpur"],
    //     "Amethi": ["Amethi", "Gauriganj", "Jagdishpur", "Jais"],
    //     "Amroha": ["Amroha", "Gajraula", "Hasanpur", "Dhanaura"],
    //     "Auraiya": ["Auraiya", "Dibiyapur", "Bidhuna"],
    //     "Ayodhya": ["Ayodhya", "Faizabad", "Bikapur"],
    //     "Azamgarh": ["Azamgarh", "Mubarakpur", "Mehnagar"],
    //     "Baghpat": ["Baghpat", "Baraut", "Khekra"],
    //     "Bahraich": ["Bahraich", "Nanpara", "Kaiserganj"],
    //     "Ballia": ["Ballia", "Rasra", "Sikandarpur"],
    //     "Balrampur": ["Balrampur", "Tulsipur", "Utraula"],
    //     "Banda": ["Banda", "Atarra", "Baberu"],
    //     "Barabanki": ["Barabanki", "Nawabganj", "Zaidpur"],
    //     "Bareilly": ["Bareilly", "Aonla", "Faridpur", "Baheri"],
    //     "Basti": ["Basti", "Harraiya", "Bhanpur"],
    //     "Bijnor": ["Bijnor", "Najibabad", "Nagina", "Dhampur", "Chandpur"],
    //     "Budaun": ["Budaun", "Ujhani", "Bisauli", "Sahaswan"],
    //     "Bulandshahr": ["Bulandshahr", "Khurja", "Sikandrabad", "Anupshahr"],
    //     "Chandauli": ["Chandauli", "Mughalsarai", "Sakaldiha"],
    //     "Chitrakoot": ["Chitrakoot", "Karwi", "Manikpur"],
    //     "Deoria": ["Deoria", "Rudrapur", "Salempur", "Barhaj"],
    //     "Etah": ["Etah", "Kasganj", "Aliganj", "Jalesar"],
    //     "Etawah": ["Etawah", "Jaswantnagar", "Bharthana"],
    //     "Farrukhabad": ["Farrukhabad", "Fatehgarh", "Kaimganj"],
    //     "Fatehpur": ["Fatehpur", "Bindki", "Khaga"],
    //     "Firozabad": ["Firozabad", "Shikohabad", "Tundla", "Sirsaganj"],
    //     "Gautam Buddha Nagar": ["Noida", "Greater Noida", "Dadri", "Jewar"],
    //     "Ghaziabad": ["Ghaziabad", "Modinagar", "Muradnagar", "Loni"],
    //     "Ghazipur": ["Ghazipur", "Zamania", "Saidpur"],
    //     "Gonda": ["Gonda", "Karnailganj", "Mankapur"],
    //     "Gorakhpur": ["Gorakhpur", "Sahjanwa", "Pipraich", "Bansgaon"],
    //     "Hamirpur": ["Hamirpur", "Rath", "Maudaha"],
    //     "Hapur": ["Hapur", "Garhmukteshwar", "Pilkhuwa"],
    //     "Hardoi": ["Hardoi", "Shahabad", "Sandila", "Mallawan"],
    //     "Hathras": ["Hathras", "Sikandra Rao", "Sadabad"],
    //     "Jalaun": ["Orai", "Konch", "Kalpi", "Madhogarh"],
    //     "Jaunpur": ["Jaunpur", "Shahganj", "Machhlishahr", "Badlapur"],
    //     "Jhansi": ["Jhansi", "Mauranipur", "Garautha", "Moth"],
    //     "Kannauj": ["Kannauj", "Chhibramau", "Tirwa"],
    //     "Kanpur Dehat": ["Akbarpur", "Rura", "Pukhrayan", "Derapur"],
    //     "Kanpur Nagar": ["Kanpur", "Bithoor", "Ghatampur"],
    //     "Kasganj": ["Kasganj", "Soron", "Patiyali"],
    //     "Kaushambi": ["Manjhanpur", "Sirathu", "Chail"],
    //     "Kushinagar": ["Padrauna", "Hata", "Kasia"],
    //     "Lakhimpur Kheri": ["Lakhimpur", "Gola Gokarannath", "Palia Kalan"],
    //     "Lalitpur": ["Lalitpur", "Mahroni", "Talbehat"],
    //     "Lucknow": ["Lucknow", "Malihabad", "Bakshi Ka Talab"],
    //     "Maharajganj": ["Maharajganj", "Nautanwa", "Siswa Bazar"],
    //     "Mahoba": ["Mahoba", "Charkhari", "Kulpahar"],
    //     "Mainpuri": ["Mainpuri", "Bhongaon", "Karhal"],
    //     "Mathura": ["Mathura", "Vrindavan", "Goverdhan", "Kosi Kalan"],
    //     "Mau": ["Mau", "Muhammadabad", "Ghosi"],
    //     "Meerut": ["Meerut", "Sardhana", "Mawana", "Hastinapur"],
    //     "Mirzapur": ["Mirzapur", "Chunar", "Ahraura"],
    //     "Moradabad": ["Moradabad", "Thakurdwara", "Bilari", "Kanth"],
    //     "Muzaffarnagar": ["Muzaffarnagar", "Khatauli", "Budhana", "Jansath"],
    //     "Pilibhit": ["Pilibhit", "Puranpur", "Bisalpur"],
    //     "Pratapgarh": ["Pratapgarh", "Kunda", "Patti"],
    //     "Rae Bareli": ["Rae Bareli", "Lalganj", "Salon"],
    //     "Rampur": ["Rampur", "Bilaspur", "Milak", "Shahabad"],
    //     "Saharanpur": ["Saharanpur", "Deoband", "Gangoh", "Nakur"],
    //     "Sambhal": ["Sambhal", "Chandausi", "Bahjoi"],
    //     "Sant Kabir Nagar": ["Khalilabad", "Mehdawal", "Dhanghata"],
    //     "Shahjahanpur": ["Shahjahanpur", "Tilhar", "Jalalabad", "Powayan"],
    //     "Shamli": ["Shamli", "Kairana", "Kandhla"],
    //     "Shravasti": ["Bhinga", "Ikauna"],
    //     "Siddharthnagar": ["Naugarh", "Bansi", "Domariyaganj"],
    //     "Sitapur": ["Sitapur", "Laharapur", "Biswan", "Mahmudabad"],
    //     "Sonbhadra": ["Robertsganj", "Obra", "Renukoot", "Dudhi"],
    //     "Sultanpur": ["Sultanpur", "Amethi", "Musafirkhana"],
    //     "Unnao": ["Unnao", "Bangarmau", "Safipur", "Purwa"],
    //     "Varanasi": ["Varanasi", "Ramnagar", "Mughalsarai"],
    // },
    // "Gujarat": {
    //     "Ahmedabad": ["Ahmedabad", "Dholka", "Sanand", "Viramgam", "Bopal"],
    //     "Amreli": ["Amreli", "Savarkundla", "Bagasara", "Dhari", "Rajula"],
    //     "Anand": ["Anand", "Khambhat", "Petlad", "Borsad", "Umreth"],
    //     "Aravalli": ["Modasa", "Bayad", "Bhiloda", "Malpur"],
    //     "Banaskantha": ["Palanpur", "Deesa", "Dhanera", "Tharad"],
    //     "Bharuch": ["Bharuch", "Ankleshwar", "Jambusar", "Hansot"],
    //     "Bhavnagar": ["Bhavnagar", "Palitana", "Mahuva", "Talaja", "Gariadhar"],
    //     "Botad": ["Botad", "Gadhada", "Barwala"],
    //     "Chhota Udaipur": ["Chhota Udaipur", "Bodeli", "Kavant"],
    //     "Dahod": ["Dahod", "Jhalod", "Limkheda", "Devgadh Baria"],
    //     "Dang": ["Ahwa", "Saputara"],
    //     "Devbhoomi Dwarka": ["Khambhalia", "Dwarka", "Okha"],
    //     "Gandhinagar": ["Gandhinagar", "Dehgam", "Mansa", "Kalol"],
    //     "Gir Somnath": ["Veraval", "Somnath", "Una", "Kodinar", "Talala"],
    //     "Jamnagar": ["Jamnagar", "Dhrol", "Kalavad", "Jamjodhpur"],
    //     "Junagadh": ["Junagadh", "Keshod", "Mangrol", "Manavadar", "Visavadar"],
    //     "Kheda": ["Nadiad", "Kheda", "Kapadvanj", "Dakor", "Mahudha"],
    //     "Kutch": ["Bhuj", "Gandhidham", "Anjar", "Mandvi", "Bhachau", "Rapar"],
    //     "Mahisagar": ["Lunawada", "Santrampur", "Balasinor"],
    //     "Mehsana": ["Mehsana", "Visnagar", "Kadi", "Unjha", "Vadnagar"],
    //     "Morbi": ["Morbi", "Wankaner", "Tankara", "Halvad"],
    //     "Narmada": ["Rajpipla", "Kevadia", "Dediapada"],
    //     "Navsari": ["Navsari", "Bilimora", "Gandevi", "Vansda"],
    //     "Panchmahal": ["Godhra", "Halol", "Kalol", "Shehra"],
    //     "Patan": ["Patan", "Sidhpur", "Chanasma", "Harij"],
    //     "Porbandar": ["Porbandar", "Ranavav", "Kutiyana"],
    //     "Rajkot": ["Rajkot", "Gondal", "Jetpur", "Dhoraji", "Upleta", "Jasdan"],
    //     "Sabarkantha": ["Himatnagar", "Idar", "Prantij", "Talod"],
    //     "Surat": ["Surat", "Bardoli", "Mandvi", "Kadodara"],
    //     "Surendranagar": ["Surendranagar", "Wadhwan", "Limbdi", "Chotila", "Dhrangadhra"],
    //     "Tapi": ["Vyara", "Songadh", "Uchchhal"],
    //     "Vadodara": ["Vadodara", "Padra", "Dabhoi", "Karjan", "Savli"],
    //     "Valsad": ["Valsad", "Vapi", "Pardi", "Umargam"],
    // },
};

// Helper function to get all state options
export const getAllStates = () => {
    return Object.keys(locations).map(state => ({
        value: state.toLowerCase().replace(/\s/g, "_"),
        label: state
    }));
};

// Helper function to get districts for a given state
export const getDistrictsByState = (selectedStateValue) => {
    const stateName = Object.keys(locations).find(
        key => key.toLowerCase().replace(/\s/g, "_") === selectedStateValue
    );
    if (stateName && locations[stateName]) {
        return Object.keys(locations[stateName]).map(district => ({
            value: district.toLowerCase().replace(/\s/g, "_"),
            label: district
        }));
    }
    return [];
};

// Helper function to get cities for a given state and district
export const getCitiesByDistrict = (selectedStateValue, selectedDistrictValue) => {
    const stateName = Object.keys(locations).find(
        key => key.toLowerCase().replace(/\s/g, "_") === selectedStateValue
    );
    const districtName = Object.keys(locations[stateName] || {}).find(
        key => key.toLowerCase().replace(/\s/g, "_") === selectedDistrictValue
    );

    if (stateName && districtName && locations[stateName][districtName]) {
        return locations[stateName][districtName].map(city => ({
            value: city.toLowerCase().replace(/\s/g, "_"),
            label: city
        }));
    }
    return [];
};
// For convenience, export an array of state names.
export const states = Object.keys(locations);