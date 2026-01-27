import { type CarBrand, type City, type PartCategory, type Partner, type Service } from "@/lib/types";

export const demoCities: City[] = [
  { id: "city-kyiv", name_ua: "Київ", slug: "kyiv", region_ua: "Київська", lat: 50.4501, lng: 30.5234 },
  { id: "city-lviv", name_ua: "Львів", slug: "lviv", region_ua: "Львівська", lat: 49.8397, lng: 24.0297 },
  { id: "city-odesa", name_ua: "Одеса", slug: "odesa", region_ua: "Одеська", lat: 46.4825, lng: 30.7233 },
  { id: "city-kharkiv", name_ua: "Харків", slug: "kharkiv", region_ua: "Харківська", lat: 49.9935, lng: 36.2304 },
  { id: "city-dnipro", name_ua: "Дніпро", slug: "dnipro", region_ua: "Дніпропетровська", lat: 48.4647, lng: 35.0462 },
  { id: "city-zaporizhzhia", name_ua: "Запоріжжя", slug: "zaporizhzhia", region_ua: "Запорізька", lat: 47.8388, lng: 35.1396 },
  { id: "city-mykolaiv", name_ua: "Миколаїв", slug: "mykolaiv", region_ua: "Миколаївська", lat: 46.975, lng: 31.9946 },
  { id: "city-kherson", name_ua: "Херсон", slug: "kherson", region_ua: "Херсонська", lat: 46.6354, lng: 32.6169 },
  { id: "city-cherkasy", name_ua: "Черкаси", slug: "cherkasy", region_ua: "Черкаська", lat: 49.4444, lng: 32.0598 },
  { id: "city-chernihiv", name_ua: "Чернігів", slug: "chernihiv", region_ua: "Чернігівська", lat: 51.4982, lng: 31.2893 },
  { id: "city-sumy", name_ua: "Суми", slug: "sumy", region_ua: "Сумська", lat: 50.9077, lng: 34.7981 },
  { id: "city-poltava", name_ua: "Полтава", slug: "poltava", region_ua: "Полтавська", lat: 49.5883, lng: 34.5514 },
  { id: "city-kropyvnytskyi", name_ua: "Кропивницький", slug: "kropyvnytskyi", region_ua: "Кіровоградська", lat: 48.5079, lng: 32.2623 },
  { id: "city-zhytomyr", name_ua: "Житомир", slug: "zhytomyr", region_ua: "Житомирська", lat: 50.2547, lng: 28.6587 },
  { id: "city-vinnytsia", name_ua: "Вінниця", slug: "vinnytsia", region_ua: "Вінницька", lat: 49.2331, lng: 28.4682 },
  { id: "city-khmelnytskyi", name_ua: "Хмельницький", slug: "khmelnytskyi", region_ua: "Хмельницька", lat: 49.4229, lng: 26.9871 },
  { id: "city-ternopil", name_ua: "Тернопіль", slug: "ternopil", region_ua: "Тернопільська", lat: 49.5535, lng: 25.5948 },
  { id: "city-ivano-frankivsk", name_ua: "Івано-Франківськ", slug: "ivano-frankivsk", region_ua: "Івано-Франківська", lat: 48.9226, lng: 24.7111 },
  { id: "city-uzhhorod", name_ua: "Ужгород", slug: "uzhhorod", region_ua: "Закарпатська", lat: 48.6208, lng: 22.2879 },
  { id: "city-lutsk", name_ua: "Луцьк", slug: "lutsk", region_ua: "Волинська", lat: 50.7472, lng: 25.3254 },
  { id: "city-rivne", name_ua: "Рівне", slug: "rivne", region_ua: "Рівненська", lat: 50.6199, lng: 26.2516 },
  { id: "city-chernivtsi", name_ua: "Чернівці", slug: "chernivtsi", region_ua: "Чернівецька", lat: 48.2915, lng: 25.9403 },
  { id: "city-donetsk", name_ua: "Донецьк", slug: "donetsk", region_ua: "Донецька", lat: 48.0159, lng: 37.8029 },
  { id: "city-luhansk", name_ua: "Луганськ", slug: "luhansk", region_ua: "Луганська", lat: 48.574, lng: 39.3078 }
];

export const demoServices: Service[] = [
  { id: "serv-diagnostyka", name_ua: "Діагностика", slug: "diagnostyka", category: "діагностика" },
  { id: "serv-khodova", name_ua: "Ходова", slug: "khodova", category: "ходова" },
  { id: "serv-maslo", name_ua: "Заміна масла", slug: "zamina-masla", category: "двигун" },
  { id: "serv-halma", name_ua: "Гальма", slug: "halma", category: "гальма" },
  { id: "serv-elektryka", name_ua: "Електрика", slug: "elektryka", category: "електрика" },
  { id: "serv-kuzovni", name_ua: "Кузовні роботи", slug: "kuzovni-roboty", category: "кузов" },
  { id: "serv-kondytsionery", name_ua: "Кондиціонери", slug: "kondytsionery", category: "електрика" },
  { id: "serv-shynomontazh", name_ua: "Шиномонтаж", slug: "shynomontazh", category: "ходова" },
  { id: "serv-rozval", name_ua: "Розвал-сходження", slug: "rozval-shodzhennia", category: "ходова" }
];

export const demoPartCategories: PartCategory[] = [
  { id: "cat-halmivna-systema", name_ua: "Гальмівна система", slug: "halmivna-systema" },
  { id: "cat-pidviska", name_ua: "Підвіска", slug: "pidviska" },
  { id: "cat-dvyhun", name_ua: "Двигун", slug: "dvyhun" },
  { id: "cat-filtry", name_ua: "Фільтри", slug: "filtry" },
  { id: "cat-masla", name_ua: "Масла та рідини", slug: "masla-ta-ridyny" },
  { id: "cat-elektryka", name_ua: "Електрика", slug: "elektryka-detal" },
  { id: "cat-kuzov", name_ua: "Кузов", slug: "kuzov" },
  { id: "cat-okholodzhennia", name_ua: "Охолодження", slug: "okholodzhennia" },
  { id: "cat-transmisiia", name_ua: "Трансмісія", slug: "transmisiia" },
  { id: "cat-shyny", name_ua: "Шини/диски", slug: "shyny-dysky" }
];

export const demoBrands: CarBrand[] = [
  { id: "brand-vw", name: "Volkswagen", slug: "volkswagen" },
  { id: "brand-audi", name: "Audi", slug: "audi" },
  { id: "brand-bmw", name: "BMW", slug: "bmw" },
  { id: "brand-mercedes", name: "Mercedes-Benz", slug: "mercedes-benz" },
  { id: "brand-toyota", name: "Toyota", slug: "toyota" },
  { id: "brand-renault", name: "Renault", slug: "renault" },
  { id: "brand-skoda", name: "Skoda", slug: "skoda" },
  { id: "brand-ford", name: "Ford", slug: "ford" },
  { id: "brand-hyundai", name: "Hyundai", slug: "hyundai" },
  { id: "brand-kia", name: "Kia", slug: "kia" },
  { id: "brand-nissan", name: "Nissan", slug: "nissan" },
  { id: "brand-opel", name: "Opel", slug: "opel" },
  { id: "brand-peugeot", name: "Peugeot", slug: "peugeot" },
  { id: "brand-citroen", name: "Citroen", slug: "citroen" },
  { id: "brand-honda", name: "Honda", slug: "honda" },
  { id: "brand-mazda", name: "Mazda", slug: "mazda" },
  { id: "brand-mitsubishi", name: "Mitsubishi", slug: "mitsubishi" },
  { id: "brand-volvo", name: "Volvo", slug: "volvo" },
  { id: "brand-chevrolet", name: "Chevrolet", slug: "chevrolet" },
  { id: "brand-seat", name: "Seat", slug: "seat" },
  { id: "brand-fiat", name: "Fiat", slug: "fiat" },
  { id: "brand-subaru", name: "Subaru", slug: "subaru" },
  { id: "brand-suzuki", name: "Suzuki", slug: "suzuki" },
  { id: "brand-lexus", name: "Lexus", slug: "lexus" },
  { id: "brand-dacia", name: "Dacia", slug: "dacia" }
];

const mapService = (slug: string) => {
  const svc = demoServices.find((s) => s.slug === slug);
  return svc ? { id: svc.id, name_ua: svc.name_ua } : { id: slug, name_ua: slug };
};

const mapCategory = (slug: string) => {
  const cat = demoPartCategories.find((c) => c.slug === slug);
  return cat ? { id: cat.id, name_ua: cat.name_ua } : { id: slug, name_ua: slug };
};

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
    services: [mapService("khodova"), mapService("diagnostyka"), mapService("zamina-masla"), mapService("halma")],
    brands: ["toyota", "volkswagen", "honda"]
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
    services: [mapService("diagnostyka"), mapService("khodova")],
    brands: ["bmw", "volkswagen"]
  },
  {
    id: "partner-sto-3",
    type: "sto",
    name: "Odesa Motor",
    slug: "odesa-motor",
    city_id: "city-odesa",
    address: "просп. Шевченка, 15",
    phone: "+380937654321",
    description: "Гальма, кондиціонери, шиномонтаж.",
    verified: true,
    status: "active",
    rating_avg: 4.6,
    services: [mapService("halma"), mapService("kondytsionery"), mapService("shynomontazh")],
    brands: ["nissan", "hyundai", "kia"]
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
    categories: [mapCategory("dvyhun"), mapCategory("halmivna-systema")],
    delivery_available: true,
    brands: ["toyota", "volkswagen"]
  },
  {
    id: "partner-shop-2",
    type: "shop",
    name: "AutoParts Львів",
    slug: "autoparts-lviv",
    city_id: "city-lviv",
    address: "вул. Зелені, 22",
    phone: "+380931112233",
    description: "Доставка по місту та області, швидкий підбір.",
    verified: true,
    status: "active",
    rating_avg: 4.5,
    categories: [mapCategory("filtry"), mapCategory("masla-ta-ridyny"), mapCategory("pidviska")],
    delivery_available: true,
    brands: ["renault", "skoda", "ford"]
  },
  {
    id: "partner-sto-4",
    type: "sto",
    name: "Kharkiv Drive",
    slug: "kharkiv-drive",
    city_id: "city-kharkiv",
    address: "просп. Науки, 25",
    phone: "+380671111222",
    description: "Електрика, шини, розвал. Працюємо з корейськими авто.",
    verified: true,
    status: "active",
    rating_avg: 4.4,
    services: [mapService("elektryka"), mapService("shynomontazh"), mapService("rozval-shodzhennia")],
    brands: ["kia", "hyundai", "nissan"]
  },
  {
    id: "partner-sto-5",
    type: "sto",
    name: "Dnipro Body & Brake",
    slug: "dnipro-body-brake",
    city_id: "city-dnipro",
    address: "вул. Грушевського, 7",
    phone: "+380503334455",
    description: "Кузов, гальма, кондиціонери. Швидкі ремонти.",
    verified: false,
    status: "active",
    rating_avg: 4.3,
    services: [mapService("kuzovni-roboty"), mapService("halma"), mapService("kondytsionery")],
    brands: ["toyota", "volkswagen", "mazda"]
  },
  {
    id: "partner-shop-3",
    type: "shop",
    name: "Odesa Parts Hub",
    slug: "odesa-parts-hub",
    city_id: "city-odesa",
    address: "вул. Пушкінська, 10",
    phone: "+380671234999",
    description: "Охолодження, електрика, фільтри. Курʼєр по Одесі.",
    verified: true,
    status: "active",
    rating_avg: 4.6,
    categories: [mapCategory("okholodzhennia"), mapCategory("elektryka-detal"), mapCategory("filtry")],
    delivery_available: true,
    brands: ["hyundai", "kia", "nissan"]
  },
  {
    id: "partner-shop-4",
    type: "shop",
    name: "Kharkiv Wheels",
    slug: "kharkiv-wheels",
    city_id: "city-kharkiv",
    address: "вул. Полтавський шлях, 120",
    phone: "+380939998877",
    description: "Шини, диски, підвіска, кузовні елементи.",
    verified: false,
    status: "active",
    rating_avg: 4.2,
    categories: [mapCategory("shyny-dysky"), mapCategory("pidviska"), mapCategory("kuzov")],
    delivery_available: false,
    brands: ["mercedes-benz", "bmw", "audi"]
  }
];
