export const shops = [
  {
    id: "campus-canteen",
    name: "Campus Canteen",
    desc: "Official campus canteen serving delicious meals and snacks",
    location: "Main Campus Building",
    hours: "8:00 AM - 8:00 PM",
    phone: "+880 1712-345678",
    status: "open",
  },
  {
    id: "tasty-bites",
    name: "Tasty Bites by Rafiq",
    desc: "Home-cooked style meals made with love.",
    location: "Hall 3, Room 205",
    hours: "9:00 AM - 9:00 PM",
    phone: "+880 1712-000111",
    status: "open",
  },
];

export const foods = [
  {
    id: "chicken-biriyani",
    name: "Chicken Biriyani",
    shopId: "tasty-bites",
    price: 180,
    rating: 4.9,
    time: "30-40 min",
    tag: "Popular",
    desc: "Authentic Dhaka style biriyani with tender chicken pieces, aromatic basmati rice",
  },
  {
    id: "vegetable-singara",
    name: "Vegetable Singara (5pcs)",
    shopId: "campus-canteen",
    price: 30,
    rating: 4.4,
    time: "5-10 min",
    tag: "Veg",
    desc: "Crispy fried pastry filled with spiced vegetable mixture.",
  },
  {
    id: "masala-chai",
    name: "Masala Chai",
    shopId: "campus-canteen",
    price: 15,
    rating: 4.6,
    time: "5 min",
    tag: "",
    desc: "Hot spiced tea with milk",
  },
];
