let users = [
  { id: "U-001", name: "Abdul Karim",    username: "admin",    password: "admin1234",   email: "admin@agromart.com",   phone: "01711000001", role: "Admin",    status: "Active",  district: "Dhaka" },

  { id: "U-002", name: "Rafiqul Islam",  username: "farmer",   password: "farmer123",   email: "rafiqul@agromart.com", phone: "01711000002", role: "Farmer",   status: "Active",  district: "Bogura",
    nid: "1990123456789", farmName: "Islam Agro Farm", land: 18 },
  { id: "U-003", name: "Anwar Hossain",  username: "anwar",    password: "anwar1234",   email: "anwar@mail.com",       phone: "01711000003", role: "Farmer",   status: "Pending", district: "Dinajpur",
    nid: "1234567890", farmName: "Hossain Krishi", land: 6 },
  { id: "U-008", name: "Kamal Uddin",    username: "kamal",    password: "kamal1234",   email: "kamal@mail.com",       phone: "01711000008", role: "Farmer",   status: "Active",  district: "Rajshahi",
    nid: "1985123456789", farmName: "Uddin Orchard", land: 25 },

  { id: "U-004", name: "Sumaiya Akter",  username: "customer", password: "customer123", email: "sumaiya@example.com",  phone: "01611000004", role: "Customer", status: "Active",  district: "Dhaka",
    preferredPayment: "bKash" },
  { id: "U-005", name: "Nasrin Sultana", username: "nasrin",   password: "nasrin1234",  email: "nasrin@example.com",   phone: "01511000005", role: "Customer", status: "Active",  district: "Dhaka",
    preferredPayment: "Cash on Delivery" },
  { id: "U-007", name: "Farhana Yasmin", username: "farhana",  password: "farhana123",  email: "farhana@example.com",  phone: "01811000007", role: "Customer", status: "Banned",  district: "Khulna",
    preferredPayment: "Nagad" },

  { id: "U-006", name: "Zahid Hasan",    username: "delivery", password: "delivery123", email: "zahid@agromart.com",   phone: "01311000006", role: "Delivery", status: "Active",  district: "Dhaka",
    nid: "1995123456789", vehicle: "Motorbike", deliveryArea: "Mirpur" },
  { id: "U-009", name: "Sohel Rana",     username: "sohel",    password: "sohel1234",   email: "sohel@mail.com",       phone: "01911000009", role: "Delivery", status: "Pending", district: "Dhaka",
    nid: "2001123456789", vehicle: "Bicycle", deliveryArea: "Uttara" }
];


const currentAdminId    = "U-001";
const currentFarmerId   = "U-002";
const currentCustomerId = "U-004";
const currentDeliveryId = "U-006";



let products = [
  { id: "P-101", name: "Bogura Potatoes",  farmerId: "U-002", farmer: "Rafiqul Islam", district: "Bogura",   category: "Vegetables",      price: 45,  unit: "kg",     stock: 320, image: "",                  rateName: "Potatoes",     description: "Fresh potatoes harvested from fields in Bogura." },
  { id: "P-102", name: "Miniket Rice",     farmerId: "U-008", farmer: "Kamal Uddin",   district: "Rajshahi", category: "Rice and Pulses", price: 72,  unit: "kg",     stock: 500, image: "images/rice.jpg",   rateName: "Miniket Rice", description: "Clean, polished Miniket rice." },
  { id: "P-103", name: "Himsagar Mangoes", farmerId: "U-008", farmer: "Kamal Uddin",   district: "Rajshahi", category: "Fruit",           price: 140, unit: "kg",     stock: 90,  image: "images/mango.jpeg", rateName: "",             description: "Sweet Himsagar mangoes from Rajshahi." },
  { id: "P-104", name: "Farm Eggs",        farmerId: "U-008", farmer: "Kamal Uddin",   district: "Pabna",    category: "Eggs and Dairy",  price: 50,  unit: "4 eggs", stock: 200, image: "images/eggs.webp",  rateName: "",             description: "Brown farm eggs." },
  { id: "P-105", name: "Local Onions",     farmerId: "U-002", farmer: "Rafiqul Islam", district: "Bogura",   category: "Vegetables",      price: 90,  unit: "kg",     stock: 140, image: "",                  rateName: "Onions",       description: "Local onions, dried and sorted." },
  { id: "P-106", name: "Green Chilies",    farmerId: "U-002", farmer: "Rafiqul Islam", district: "Bogura",   category: "Spices",          price: 120, unit: "kg",     stock: 18,  image: "",                  rateName: "Chilies",      description: "Hot green chilies, picked this week." },
  { id: "P-107", name: "Mustard Oil",      farmerId: "U-008", farmer: "Kamal Uddin",   district: "Pabna",    category: "Spices",          price: 260, unit: "liter",  stock: 75,  image: "",                  rateName: "",             description: "Cold-pressed mustard oil." },
  { id: "P-108", name: "Cow's Milk",       farmerId: "U-008", farmer: "Kamal Uddin",   district: "Pabna",    category: "Eggs and Dairy",  price: 90,  unit: "liter",  stock: 60,  image: "",                  rateName: "",             description: "Fresh milk, delivered every morning." },
  { id: "P-109", name: "Fresh Tomatoes",   farmerId: "U-002", farmer: "Rafiqul Islam", district: "Bogura",   category: "Vegetables",      price: 50,  unit: "kg",     stock: 150, image: "images/tomato.webp",rateName: "Tomatoes",     description: "Red, firm tomatoes." }
];


const lowStockLimit = 20;


let outOfStockProducts = [
  { id: "P-110", name: "Masoor Dal",        district: "Faridpur", category: "Rice and Pulses", price: 130, unit: "kg",      stock: 0 },
  { id: "P-111", name: "Date Palm Jaggery", district: "Jashore",  category: "Spices",          price: 350, unit: "kg",      stock: 0 },
  { id: "P-112", name: "Turmeric Powder",   district: "Bogura",   category: "Spices",          price: 380, unit: "kg",      stock: 0 },
  { id: "P-113", name: "Litchi",            district: "Dinajpur", category: "Fruit",           price: 400, unit: "100 pcs", stock: 0 }
];



let marketRates = [
  { name: "Potatoes",     min: 40,  max: 48,  trend: "Down" },
  { name: "Onions",       min: 75,  max: 85,  trend: "Up" },
  { name: "Miniket Rice", min: 68,  max: 76,  trend: "Same" },
  { name: "Tomatoes",     min: 55,  max: 70,  trend: "Up" },
  { name: "Chilies",      min: 110, max: 130, trend: "Down" }
];
