export interface FoodItem {
  id: string;
  shopId: string;
  name: string;
  price: number;
  rating: number;
  time: string;
  desc: string;
  tag?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  location: string;
  hours: string;
  phone: string;
}

export const shops: ShopItem[] = [
  {
    id: "shop-1",
    name: "Campus Bites",
    desc: "Quick snacks and meals for students.",
    location: "Main Gate",
    hours: "9:00 AM - 10:00 PM",
    phone: "+8801700000001",
  },
  {
    id: "shop-2",
    name: "JU Food Corner",
    desc: "Affordable lunch and dinner combos.",
    location: "Central Cafeteria",
    hours: "10:00 AM - 11:00 PM",
    phone: "+8801700000002",
  },
];

export const foods: FoodItem[] = [
  {
    id: "food-1",
    shopId: "shop-1",
    name: "Chicken Burger Meal",
    price: 180,
    rating: 4.6,
    time: "20-25 min",
    desc: "Chicken burger with fries and a soft drink.",
    tag: "Best Seller",
  },
  {
    id: "food-2",
    shopId: "shop-1",
    name: "Beef Kacchi",
    price: 260,
    rating: 4.8,
    time: "30-35 min",
    desc: "Traditional kacchi with tender beef and aromatic rice.",
  },
  {
    id: "food-3",
    shopId: "shop-2",
    name: "Vegetable Fried Rice",
    price: 140,
    rating: 4.4,
    time: "15-20 min",
    desc: "Fresh vegetable fried rice with egg option.",
  },
];
