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

const orderSteps = ["Placed", "Packed", "Picked", "On the way", "Delivered"];

let orders = [
  { id: "AM-10241", customerId: "U-004", customerName: "Sumaiya Akter",  phone: "01611000004", area: "Mirpur 12", address: "House 12, Road 5, Mirpur 12",
    deliveryId: "U-006", payment: "bKash",            paid: true,  status: "Delivered",  date: "2026-10-24",
    items: [ { productId: "P-101", name: "Bogura Potatoes", price: 45, qty: 2 }, { productId: "P-102", name: "Miniket Rice", price: 72, qty: 3 } ] },
  { id: "AM-10244", customerId: "U-005", customerName: "Nasrin Sultana", phone: "01511000005", area: "Mirpur 10", address: "Block C, Mirpur 10",
    deliveryId: "U-006", payment: "Cash on Delivery", paid: false, status: "Packed",     date: "2026-11-01",
    items: [ { productId: "P-107", name: "Mustard Oil", price: 260, qty: 3 }, { productId: "P-103", name: "Himsagar Mangoes", price: 140, qty: 2 }, { productId: "P-101", name: "Bogura Potatoes", price: 45, qty: 4 } ] },
  { id: "AM-10245", customerId: "U-004", customerName: "Sumaiya Akter",  phone: "01611000004", area: "Mirpur 12", address: "House 12, Road 5, Mirpur 12",
    deliveryId: "U-006", payment: "bKash",            paid: true,  status: "On the way", date: "2026-11-01",
    items: [ { productId: "P-102", name: "Miniket Rice", price: 72, qty: 5 }, { productId: "P-101", name: "Bogura Potatoes", price: 45, qty: 4 } ] },
  { id: "AM-10246", customerId: "U-005", customerName: "Nasrin Sultana", phone: "01511000005", area: "Uttara",    address: "Sector 7, Uttara",
    deliveryId: "U-006", payment: "Cash on Delivery", paid: false, status: "Packed",     date: "2026-11-02",
    items: [ { productId: "P-108", name: "Cow's Milk", price: 90, qty: 4 }, { productId: "P-104", name: "Farm Eggs", price: 50, qty: 8 } ] },
  { id: "AM-10247", customerId: "U-004", customerName: "Sumaiya Akter",  phone: "01611000004", area: "Mirpur 12", address: "House 12, Road 5, Mirpur 12",
    deliveryId: "U-006", payment: "Cash on Delivery", paid: false, status: "Placed",     date: "2026-11-03",
    items: [ { productId: "P-109", name: "Fresh Tomatoes", price: 50, qty: 3 }, { productId: "P-106", name: "Green Chilies", price: 120, qty: 1 } ] }
];


//  Admin: moderation log and monthly sales 
let moderationLog = [
  { time: "2026-10-31 09:30", message: "New farmer waiting for approval: Anwar Hossain" },
  { time: "2026-10-30 16:22", message: "Banned Farhana Yasmin (fake payment reports)" }
];

let monthlySales = [
  { month: "August",    orders: 280, sales: 280000 },
  { month: "September", orders: 320, sales: 320000 },
  { month: "October",   orders: 360, sales: 360000 }
];


// Farmer: crop plans, crop types and payouts 
let cropTypes = [
  { name: "Aman Rice", days: 120 },
  { name: "Potatoes",  days: 90 },
  { name: "Mustard",   days: 85 },
  { name: "Tomatoes",  days: 75 },
  { name: "Onions",    days: 110 },
  { name: "Chilies",   days: 100 }
];

let cropPlans = [
  { id: "C-001", farmerId: "U-002", crop: "Aman Rice", land: 10, sowDate: "2026-07-15" },
  { id: "C-002", farmerId: "U-002", crop: "Potatoes",  land: 5,  sowDate: "2026-11-25" },
  { id: "C-003", farmerId: "U-002", crop: "Mustard",   land: 3,  sowDate: "2026-10-10" }
];

// One object: read with dot notation, e.g. farmerWallet.balance
let farmerWallet = {
  balance: 18200,
  paidOut: 8000
};

let payouts = [
  { id: "W-002", farmerId: "U-002", date: "2026-10-27", method: "Nagad", number: "01711000002", amount: 3000, status: "Paid" },
  { id: "W-001", farmerId: "U-002", date: "2026-10-12", method: "bKash", number: "01711000002", amount: 5000, status: "Paid" }
];


//  Customer: addresses, cart, alerts and reviews 
let addresses = [
  { id: "A-001", customerId: "U-004", label: "Home",   recipient: "Sumaiya Akter", phone: "01611000004", area: "Mirpur 12",  district: "Dhaka",  details: "House 12, Road 5, Mirpur 12" },
  { id: "A-002", customerId: "U-004", label: "Office", recipient: "Sumaiya Akter", phone: "01611000004", area: "Motijheel",  district: "Dhaka",  details: "Level 4, City Tower, Motijheel" },
  { id: "A-003", customerId: "U-004", label: "Other",  recipient: "Rokeya Begum",  phone: "01911000012", area: "Sonadanga",  district: "Khulna", details: "Road 3, Sonadanga R/A" }
];

let cart = [
  { productId: "P-101", qty: 2 },
  { productId: "P-105", qty: 1 },
  { productId: "P-102", qty: 5 }
];

let priceAlerts = [
  { id: "PA-001", customerId: "U-004", productId: "P-105", target: 75,  notifyBy: ["In-app"] },
  { id: "PA-002", customerId: "U-004", productId: "P-107", target: 245, notifyBy: ["In-app", "SMS"] },
  { id: "PA-003", customerId: "U-004", productId: "P-103", target: 120, notifyBy: ["In-app"] }
];

let priceNotifications = [
  { time: "2026-11-03 · 09:15 AM", via: "In-app, SMS", text: "<strong>Mustard Oil</strong> was <strong>Tk 240 / liter</strong> for a day (normal price Tk 260). It was below your target of Tk 245." },
  { time: "2026-10-28 · 06:40 PM", via: "In-app",      text: "<strong>Miniket Rice</strong> dropped to <strong>Tk 68 / kg</strong> (was Tk 72). Price is back to Tk 72 now." }
];

let stockAlerts = [
  { id: "SA-001", customerId: "U-004", productId: "P-110", date: "2026-10-25" },
  { id: "SA-002", customerId: "U-004", productId: "P-111", date: "2026-10-30" },
  { id: "SA-003", customerId: "U-004", productId: "P-106", date: "2026-10-18" }
];

let stockNotifications = [
  { time: "2026-11-02 · 11:05 AM", via: "In-app, SMS", text: "<strong>Green Chilies</strong> are back in stock. 18 kg available at Tk 120 / kg. Order soon, stock is low." },
  { time: "2026-10-22 · 07:30 AM", via: "In-app",      text: "<strong>Cow's Milk</strong> is back in stock. 60 liters available at Tk 90 / liter." }
];

let reviews = [
  { productId: "P-108", product: "Cow's Milk", customerId: "U-005", customer: "Nasrin Sultana", rating: 4, comment: "Fresh and tasty.", date: "2026-10-20" }
];


//  Delivery man: trips, status log and earnings 
const earningPerDelivery = 80;   // Taka for each delivered order

let trips = [
  { id: "T-001", deliveryId: "U-006", date: "2026-10-30", area: "Mirpur",    vehicle: "Motorbike", distance: 24, fuel: 180, note: "Heavy traffic near Mirpur 10." },
  { id: "T-002", deliveryId: "U-006", date: "2026-10-31", area: "Uttara",    vehicle: "Motorbike", distance: 38, fuel: 290, note: "Two customers were not at home." },
  { id: "T-003", deliveryId: "U-006", date: "2026-11-01", area: "Dhanmondi", vehicle: "Van",       distance: 15, fuel: 150, note: "Bulk rice delivery." }
];

let statusLog = [
  { time: "2026-11-01 15:10", orderId: "AM-10245", status: "On the way" }
];

let deliveryEarnings = [
  { date: "2026-10-30", deliveries: 6 },
  { date: "2026-10-31", deliveries: 7 },
  { date: "2026-11-01", deliveries: 5 }
];
