// Major wholesale markets (APMC yards) across every state and union
// territory. Coordinates are city-level (good enough to rank "nearest"), and
// `known` lists produce each market is well known for. Live daily prices come
// separately from Agmarknet via /api/mandi-prices.
const m = (id, name, city, district, state, lat, lng, known) => ({ id, name, city, district, state, lat, lng, known });

const mandis = [
  // North
  m('azadpur', 'Azadpur Market', 'Delhi', 'North West Delhi', 'Delhi', 28.7076, 77.1764, ['Tomato', 'Onion', 'Potato', 'Apple', 'Banana', 'Green Chilli']),
  m('okhla', 'Okhla Vegetable Market', 'Delhi', 'South East Delhi', 'Delhi', 28.5355, 77.282, ['Tomato', 'Onion', 'Potato', 'Cauliflower']),
  m('ghazipur', 'Ghazipur Market', 'Delhi', 'East Delhi', 'Delhi', 28.625, 77.324, ['Banana', 'Apple', 'Tomato']),
  m('sahibabad', 'Sahibabad Market', 'Ghaziabad', 'Ghaziabad', 'Uttar Pradesh', 28.68, 77.36, ['Tomato', 'Potato', 'Onion']),
  m('khandsa', 'Khandsa Market', 'Gurugram', 'Gurugram', 'Haryana', 28.443, 77.019, ['Onion', 'Potato', 'Tomato']),
  m('karnal', 'Karnal Grain Market', 'Karnal', 'Karnal', 'Haryana', 29.6857, 76.9905, ['Rice', 'Wheat']),
  m('ludhiana', 'Bahadurke Road Market', 'Ludhiana', 'Ludhiana', 'Punjab', 30.901, 75.8573, ['Potato', 'Wheat', 'Cauliflower']),
  m('amritsar', 'Vallah Market', 'Amritsar', 'Amritsar', 'Punjab', 31.634, 74.8723, ['Potato', 'Onion', 'Rice']),
  m('jalandhar', 'Maqsudan Market', 'Jalandhar', 'Jalandhar', 'Punjab', 31.326, 75.5762, ['Potato', 'Cabbage']),
  m('chandigarh', 'Sector 26 Market', 'Chandigarh', 'Chandigarh', 'Chandigarh', 30.729, 76.804, ['Tomato', 'Onion', 'Apple']),
  m('solan', 'Solan Market', 'Solan', 'Solan', 'Himachal Pradesh', 30.9045, 77.0967, ['Tomato', 'Capsicum', 'Ginger']),
  m('dhalli', 'Dhalli Fruit Market', 'Shimla', 'Shimla', 'Himachal Pradesh', 31.1048, 77.1734, ['Apple', 'Pear']),
  m('parimpora', 'Parimpora Fruit Market', 'Srinagar', 'Srinagar', 'Jammu and Kashmir', 34.11, 74.78, ['Apple', 'Walnut']),
  m('narwal', 'Narwal Market', 'Jammu', 'Jammu', 'Jammu and Kashmir', 32.73, 74.857, ['Rice', 'Onion', 'Potato']),
  m('leh', 'Leh Vegetable Market', 'Leh', 'Leh', 'Ladakh', 34.1526, 77.5771, ['Apricot', 'Potato', 'Cabbage']),
  m('niranjanpur', 'Niranjanpur Market', 'Dehradun', 'Dehradun', 'Uttarakhand', 30.3165, 78.0322, ['Tomato', 'Potato', 'Rice']),
  m('haldwani', 'Haldwani Market', 'Haldwani', 'Nainital', 'Uttarakhand', 29.2183, 79.513, ['Potato', 'Tomato', 'Ginger']),
  m('dubagga', 'Dubagga Market', 'Lucknow', 'Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, ['Mango', 'Banana', 'Potato']),
  m('sikandra', 'Sikandra Market', 'Agra', 'Agra', 'Uttar Pradesh', 27.1767, 78.0081, ['Potato', 'Onion']),
  m('kanpur', 'Naveen Grain Market', 'Kanpur', 'Kanpur Nagar', 'Uttar Pradesh', 26.4499, 80.3319, ['Wheat', 'Rice', 'Potato']),
  m('pahariya', 'Pahariya Market', 'Varanasi', 'Varanasi', 'Uttar Pradesh', 25.3176, 82.9739, ['Green Chilli', 'Brinjal', 'Tomato']),

  // West
  m('muhana', 'Muhana Market', 'Jaipur', 'Jaipur', 'Rajasthan', 26.8, 75.77, ['Tomato', 'Onion', 'Green Chilli', 'Cauliflower']),
  m('jodhpur', 'Jodhpur Fruit & Vegetable Market', 'Jodhpur', 'Jodhpur', 'Rajasthan', 26.2389, 73.0243, ['Onion', 'Cumin', 'Red Chilli']),
  m('kota', 'Bhamashah Market', 'Kota', 'Kota', 'Rajasthan', 25.2138, 75.8648, ['Coriander', 'Wheat', 'Garlic']),
  m('jamalpur', 'Jamalpur Market', 'Ahmedabad', 'Ahmedabad', 'Gujarat', 23.0225, 72.5714, ['Tomato', 'Onion', 'Potato', 'Brinjal']),
  m('surat', 'Sardar Market', 'Surat', 'Surat', 'Gujarat', 21.1702, 72.8311, ['Onion', 'Tomato', 'Banana']),
  m('rajkot', 'Rajkot Marketing Yard', 'Rajkot', 'Rajkot', 'Gujarat', 22.3039, 70.8022, ['Groundnut', 'Cotton', 'Garlic']),
  m('vadodara', 'Vadodara APMC', 'Vadodara', 'Vadodara', 'Gujarat', 22.3072, 73.1812, ['Tomato', 'Banana', 'Onion']),
  m('unjha', 'Unjha APMC', 'Unjha', 'Mehsana', 'Gujarat', 23.804, 72.394, ['Cumin', 'Fennel']),
  m('vashi', 'Vashi APMC', 'Navi Mumbai', 'Thane', 'Maharashtra', 19.0771, 73.006, ['Onion', 'Potato', 'Tomato', 'Mango', 'Banana']),
  m('gultekdi', 'Gultekdi Market Yard', 'Pune', 'Pune', 'Maharashtra', 18.49, 73.868, ['Tomato', 'Onion', 'Green Chilli', 'Cauliflower']),
  m('lasalgaon', 'Lasalgaon APMC', 'Lasalgaon', 'Nashik', 'Maharashtra', 20.15, 74.2333, ['Onion']),
  m('nashik', 'Nashik APMC', 'Nashik', 'Nashik', 'Maharashtra', 19.9975, 73.7898, ['Tomato', 'Onion', 'Grapes']),
  m('kalamna', 'Kalamna Market', 'Nagpur', 'Nagpur', 'Maharashtra', 21.1458, 79.0882, ['Orange', 'Onion', 'Potato']),
  m('kolhapur', 'Shahu Market Yard', 'Kolhapur', 'Kolhapur', 'Maharashtra', 16.705, 74.2433, ['Jaggery', 'Onion', 'Potato']),
  m('aurangabad', 'Jadhavwadi Market', 'Chhatrapati Sambhajinagar', 'Aurangabad', 'Maharashtra', 19.8762, 75.3433, ['Onion', 'Tomato']),
  m('solapur', 'Solapur APMC', 'Solapur', 'Solapur', 'Maharashtra', 17.6599, 75.9064, ['Onion', 'Pomegranate']),
  m('mapusa', 'Mapusa Market', 'Mapusa', 'North Goa', 'Goa', 15.5937, 73.8142, ['Onion', 'Potato', 'Coconut']),
  m('silvassa', 'Silvassa Market', 'Silvassa', 'Dadra and Nagar Haveli', 'Dadra and Nagar Haveli and Daman and Diu', 20.27, 73.008, ['Tomato', 'Onion']),

  // Central
  m('choithram', 'Choithram Market', 'Indore', 'Indore', 'Madhya Pradesh', 22.7196, 75.8577, ['Potato', 'Onion', 'Garlic', 'Tomato']),
  m('karond', 'Karond Market', 'Bhopal', 'Bhopal', 'Madhya Pradesh', 23.2599, 77.4126, ['Wheat', 'Onion', 'Tomato']),
  m('neemuch', 'Neemuch Market', 'Neemuch', 'Neemuch', 'Madhya Pradesh', 24.47, 74.87, ['Garlic', 'Coriander']),
  m('jabalpur', 'Jabalpur Agricultural Produce Market', 'Jabalpur', 'Jabalpur', 'Madhya Pradesh', 23.1815, 79.9864, ['Green Peas', 'Tomato']),
  m('raipur', 'Shastri Market', 'Raipur', 'Raipur', 'Chhattisgarh', 21.2514, 81.6296, ['Tomato', 'Rice', 'Brinjal']),

  // East and North-East
  m('patna', 'Market Committee', 'Patna', 'Patna', 'Bihar', 25.5941, 85.1376, ['Potato', 'Onion', 'Banana']),
  m('muzaffarpur', 'Muzaffarpur Market', 'Muzaffarpur', 'Muzaffarpur', 'Bihar', 26.1209, 85.3647, ['Litchi', 'Banana']),
  m('pandra', 'Pandra Market Committee', 'Ranchi', 'Ranchi', 'Jharkhand', 23.3441, 85.3096, ['Tomato', 'Green Chilli', 'Potato']),
  m('koley', 'Koley Market', 'Kolkata', 'Kolkata', 'West Bengal', 22.5726, 88.3639, ['Potato', 'Onion', 'Brinjal', 'Green Chilli']),
  m('siliguri', 'Siliguri Regulated Market', 'Siliguri', 'Darjeeling', 'West Bengal', 26.7271, 88.3953, ['Ginger', 'Potato', 'Pineapple']),
  m('bardhaman', 'Bardhaman Market', 'Bardhaman', 'Purba Bardhaman', 'West Bengal', 23.2324, 87.8615, ['Potato', 'Rice']),
  m('bhubaneswar', 'Unit-1 Market', 'Bhubaneswar', 'Khordha', 'Odisha', 20.2961, 85.8245, ['Tomato', 'Brinjal', 'Onion']),
  m('cuttack', 'Chhatra Bazar', 'Cuttack', 'Cuttack', 'Odisha', 20.4625, 85.883, ['Potato', 'Onion', 'Green Chilli']),
  m('guwahati', 'Fancy Bazaar Wholesale Market', 'Guwahati', 'Kamrup Metropolitan', 'Assam', 26.1445, 91.7362, ['Ginger', 'Banana', 'Potato']),
  m('shillong', 'Iewduh Market', 'Shillong', 'East Khasi Hills', 'Meghalaya', 25.5788, 91.8933, ['Potato', 'Ginger', 'Turmeric']),
  m('agartala', 'Maharajganj Bazar', 'Agartala', 'West Tripura', 'Tripura', 23.8315, 91.2868, ['Pineapple', 'Banana', 'Rice']),
  m('imphal', 'Khwairamband Bazar', 'Imphal', 'Imphal West', 'Manipur', 24.817, 93.9368, ['Rice', 'Green Chilli']),
  m('aizawl', 'Bara Bazar', 'Aizawl', 'Aizawl', 'Mizoram', 23.7271, 92.7176, ['Ginger', 'Banana']),
  m('kohima', 'Kohima Market', 'Kohima', 'Kohima', 'Nagaland', 25.6747, 94.11, ['Green Chilli', 'Ginger']),
  m('itanagar', 'Itanagar Market', 'Itanagar', 'Papum Pare', 'Arunachal Pradesh', 27.0844, 93.6053, ['Ginger', 'Orange']),
  m('gangtok', 'Lal Market', 'Gangtok', 'Gangtok', 'Sikkim', 27.3389, 88.6065, ['Ginger', 'Cardamom']),
  m('port-blair', 'Aberdeen Bazaar', 'Port Blair', 'South Andaman', 'Andaman and Nicobar Islands', 11.6234, 92.7265, ['Coconut', 'Banana']),

  // South
  m('bowenpally', 'Bowenpally Market', 'Hyderabad', 'Medchal-Malkajgiri', 'Telangana', 17.47, 78.48, ['Tomato', 'Onion', 'Green Chilli', 'Brinjal']),
  m('gaddiannaram', 'Gaddiannaram Fruit Market', 'Hyderabad', 'Ranga Reddy', 'Telangana', 17.36, 78.55, ['Banana', 'Mango', 'Apple']),
  m('enumamula', 'Enumamula Market Yard', 'Warangal', 'Hanamkonda', 'Telangana', 17.9689, 79.5941, ['Red Chilli', 'Cotton']),
  m('madanapalle', 'Madanapalle Tomato Market', 'Madanapalle', 'Annamayya', 'Andhra Pradesh', 13.55, 78.5, ['Tomato']),
  m('kurnool', 'Kurnool Market Yard', 'Kurnool', 'Kurnool', 'Andhra Pradesh', 15.8281, 78.0373, ['Onion', 'Groundnut']),
  m('guntur', 'Guntur Chilli Yard', 'Guntur', 'Guntur', 'Andhra Pradesh', 16.3067, 80.4365, ['Red Chilli', 'Turmeric']),
  m('vijayawada', 'Vijayawada Farmers Market', 'Vijayawada', 'NTR', 'Andhra Pradesh', 16.5062, 80.648, ['Tomato', 'Banana', 'Onion']),
  m('kr-market', 'K.R. Market', 'Bengaluru', 'Bengaluru Urban', 'Karnataka', 12.965, 77.577, ['Tomato', 'Onion', 'Green Chilli', 'Banana']),
  m('yeshwanthpur', 'Yeshwanthpur APMC', 'Bengaluru', 'Bengaluru Urban', 'Karnataka', 13.028, 77.54, ['Onion', 'Potato', 'Rice']),
  m('kolar', 'Kolar APMC', 'Kolar', 'Kolar', 'Karnataka', 13.136, 78.129, ['Tomato']),
  m('hubballi', 'Hubballi APMC', 'Hubballi', 'Dharwad', 'Karnataka', 15.3647, 75.124, ['Onion', 'Red Chilli']),
  m('mysuru', 'Bandipalya APMC', 'Mysuru', 'Mysuru', 'Karnataka', 12.2958, 76.6394, ['Tomato', 'Banana', 'Onion']),
  m('byadgi', 'Byadgi Market', 'Byadgi', 'Haveri', 'Karnataka', 14.673, 75.487, ['Red Chilli']),
  m('koyambedu', 'Koyambedu Market', 'Chennai', 'Chennai', 'Tamil Nadu', 13.07, 80.195, ['Tomato', 'Onion', 'Banana', 'Lemon']),
  m('oddanchatram', 'Oddanchatram Market', 'Oddanchatram', 'Dindigul', 'Tamil Nadu', 10.486, 77.747, ['Tomato', 'Brinjal', 'Green Chilli']),
  m('mattuthavani', 'Mattuthavani Market', 'Madurai', 'Madurai', 'Tamil Nadu', 9.94, 78.15, ['Banana', 'Onion', 'Tomato']),
  m('coimbatore', 'MGR Market', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', 11.0168, 76.9558, ['Tomato', 'Onion', 'Coconut']),
  m('salem', 'Salem Market', 'Salem', 'Salem', 'Tamil Nadu', 11.6643, 78.146, ['Turmeric', 'Mango', 'Tomato']),
  m('goubert', 'Goubert Market', 'Puducherry', 'Puducherry', 'Puducherry', 11.9339, 79.8306, ['Banana', 'Tomato', 'Onion']),
  m('ernakulam', 'Ernakulam Market', 'Kochi', 'Ernakulam', 'Kerala', 9.9816, 76.2999, ['Banana', 'Coconut', 'Ginger']),
  m('chalai', 'Chalai Market', 'Thiruvananthapuram', 'Thiruvananthapuram', 'Kerala', 8.4875, 76.9525, ['Banana', 'Tomato', 'Onion']),
  m('palayam', 'Palayam Market', 'Kozhikode', 'Kozhikode', 'Kerala', 11.2588, 75.7804, ['Banana', 'Coconut', 'Pepper']),
  m('kavaratti', 'Kavaratti Market', 'Kavaratti', 'Lakshadweep', 'Lakshadweep', 10.5626, 72.6369, ['Coconut']),
];

// Produce shoppers can filter markets by. `api` is the Agmarknet commodity name.
export const MARKET_ITEMS = [
  { label: 'Tomato', api: 'Tomato' },
  { label: 'Onion', api: 'Onion' },
  { label: 'Potato', api: 'Potato' },
  { label: 'Green Chilli', api: 'Green Chilli' },
  { label: 'Garlic', api: 'Garlic' },
  { label: 'Ginger', api: 'Ginger(Green)' },
  { label: 'Brinjal', api: 'Brinjal' },
  { label: 'Cauliflower', api: 'Cauliflower' },
  { label: 'Banana', api: 'Banana' },
  { label: 'Apple', api: 'Apple' },
  { label: 'Rice', api: 'Rice' },
  { label: 'Wheat', api: 'Wheat' },
];

// Shop products that have a matching market commodity, for "See wholesale prices".
export const PRODUCT_MARKET_ITEM = {
  tomato: 'Tomato',
  onion: 'Onion',
  potato: 'Potato',
  'green-chilli': 'Green Chilli',
  garlic: 'Garlic',
  ginger: 'Ginger',
  banana: 'Banana',
  rice: 'Rice',
  atta: 'Wheat',
};

export default mandis;
