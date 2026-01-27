import { type CarBrand, type City, type PartCategory, type Partner, type Service } from "@/lib/types";

export const demoCities: City[] = [
  { id: "city-kyiv", name_ua: "Київ", slug: "kyiv", region_ua: "Київська", lat: 50.4501, lng: 30.5234 },
  { id: "city-lviv", name_ua: "Львів", slug: "lviv", region_ua: "Львівська", lat: 49.8397, lng: 24.0297 },
  { id: "city-odesa", name_ua: "Одеса", slug: "odesa", region_ua: "Одеська", lat: 46.4825, lng: 30.7233 }
];

export const demoServices: Service[] = [
  { id: "serv-diagnostyka", name_ua: "Діагностика", slug: "diagnostyka", category: "діагностика" },
  { id: "serv-khodova", name_ua: "Ходова", slug: "khodova", category: "ходова" },
  { id: "serv-maslo", name_ua: "Заміна масла", slug: "zamina-masla", category: "двигун" }
];

export const demoPartCategories: PartCategory[] = [
  { id: "cat-dvyhun", name_ua: "Двигун", slug: "dvyhun" },
  { id: "cat-hodova", name_ua: "Підвіска", slug: "pidviska" },
  { id: "cat-galma", name_ua: "Гальмівна система", slug: "halmivna-systema" }
];

export const demoBrands: CarBrand[] = [
  { id: "brand-toyota", name: "Toyota", slug: "toyota" },
  { id: "brand-vw", name: "Volkswagen", slug: "volkswagen" },
  { id: "brand-bmw", name: "BMW", slug: "bmw" }
];

export const demoPartners: Partner[] = [
  {
    id: "partner-sto-1",
    type: "sto",
    name: "DriveTech СТО",
    slug: "drivetech",
    city_id: "city-kyiv",
    address: "вул. Антоновича, 44",
    lat: 50.438,
    lng: 30.516,
    phone: "+380671234567",
    description: "Повний спектр сервісу, ходова та електрика.",
    verified: true,
    status: "active",
    rating_avg: 4.8,
    services: ["khodova", "diagnostyka", "zamina-masla"],
    brands: ["toyota", "volkswagen"]
  },
  {
    id: "partner-sto-2",
    type: "sto",
    name: "Lviv Auto Service",
    slug: "lviv-auto",
    city_id: "city-lviv",
    address: "просп. Червоної Калини, 99",
    phone: "+380501112233",
    description: "Швидкий сервіс для європейських брендів.",
    verified: false,
    status: "active",
    rating_avg: 4.5,
    services: ["diagnostyka", "khodova"],
    brands: ["bmw", "volkswagen"]
  },
  {
    id: "partner-shop-1",
    type: "shop",
    name: "PartLab Магазин",
    slug: "partlab",
    city_id: "city-kyiv",
    address: "вул. Січових Стрільців, 12",
    phone: "+380681234567",
    description: "Оригінал та якісні аналоги. Доставка по Києву.",
    verified: true,
    status: "active",
    rating_avg: 4.7,
    categories: ["dvyhun", "halmivna-systema"],
    delivery_available: true,
    brands: ["toyota", "volkswagen"]
  }
];
