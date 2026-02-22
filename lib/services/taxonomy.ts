import { type Service, type ServiceCategory, type StationService } from "@/lib/types";

type TaxonomyServiceSeed = Omit<Service, "name_ua"> & { name: string };

function svc(seed: TaxonomyServiceSeed): Service {
  return {
    id: seed.id,
    name_ua: seed.name,
    slug: seed.slug,
    categoryId: seed.categoryId,
    keywords: seed.keywords ?? [],
    isPopular: seed.isPopular ?? false,
    sortOrder: seed.sortOrder ?? 0,
    category: null
  };
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "cat-sto-remont",
    name: "Ремонт / СТО",
    slug: "sto-remont",
    short: "Діагностика, ходова, гальма, ТО, електрика",
    description: "Базові та складні ремонтні роботи, діагностика та технічне обслуговування.",
    sortOrder: 10
  },
  {
    id: "cat-detailing",
    name: "Детейлінг",
    slug: "detailing",
    short: "Полірування, захист, хімчистка салону",
    description: "Догляд за кузовом і салоном: полірування, захист, хімчистка.",
    sortOrder: 20
  },
  {
    id: "cat-tyres",
    name: "Шини / Диски",
    slug: "shyny-dysky",
    short: "Шиномонтаж, балансування, ремонт шин",
    description: "Шиномонтаж, балансування, ремонт шин і дисків.",
    sortOrder: 30
  },
  {
    id: "cat-body-paint",
    name: "Кузов / Фарбування",
    slug: "kuzov-farbuvannia",
    short: "Рихтування, фарбування, PDR",
    description: "Кузовні роботи, рихтування, фарбування, PDR.",
    sortOrder: 40
  },
  {
    id: "cat-glass",
    name: "Скло / Світло",
    slug: "sklo",
    short: "Заміна скла, ремонт сколів, полірування фар",
    description: "Ремонт і заміна скла, полірування фар.",
    sortOrder: 50
  },
  {
    id: "cat-ac",
    name: "Кондиціонери",
    slug: "avto-kondytsionery",
    short: "Заправка, діагностика, ремонт кондиціонера",
    description: "Діагностика, заправка та ремонт кондиціонерів.",
    sortOrder: 60
  },
  {
    id: "cat-tuning",
    name: "Тюнінг",
    slug: "tyuning",
    short: "Стайлінг, доопрацювання, аксесуари",
    description: "Тюнінг та доопрацювання авто: зовнішній вигляд, комфорт, індивідуальні рішення.",
    sortOrder: 70
  },
  {
    id: "cat-evac",
    name: "Евакуація",
    slug: "evakuatsiya",
    short: "Евакуатор, транспортування авто",
    description: "Евакуатор та транспортування авто до СТО або на іншу адресу.",
    sortOrder: 80
  },
  {
    id: "cat-wash",
    name: "Мийка",
    slug: "myika",
    short: "Автомийка, чистка, базовий догляд",
    description: "Автомийка та базовий догляд за авто: кузов, салон, швидке обслуговування.",
    sortOrder: 90
  }
];

export const taxonomyServices: Service[] = [
  // Ремонт / СТО
  svc({ id: "serv-diagnostyka", name: "Діагностика", slug: "diagnostyka", categoryId: "cat-sto-remont", keywords: ["сканер", "check engine"], isPopular: true, sortOrder: 10 }),
  svc({ id: "serv-khodova", name: "Ходова", slug: "khodova", categoryId: "cat-sto-remont", keywords: ["ходова частина", "стуки"], isPopular: true, sortOrder: 20 }),
  svc({ id: "serv-pidviska", name: "Підвіска", slug: "pidviska-servis", categoryId: "cat-sto-remont", keywords: ["амортизатори", "пружини"], isPopular: true, sortOrder: 30 }),
  svc({ id: "serv-halma", name: "Гальма", slug: "halma", categoryId: "cat-sto-remont", keywords: ["колодки", "диски", "супорт"], isPopular: true, sortOrder: 40 }),
  svc({ id: "serv-to", name: "Техобслуговування (ТО)", slug: "tekh-obslugovuvannia", categoryId: "cat-sto-remont", keywords: ["то", "регламент", "масло"], isPopular: true, sortOrder: 50 }),
  svc({ id: "serv-maslo", name: "Заміна масла", slug: "zamina-masla", categoryId: "cat-sto-remont", keywords: ["масло", "фільтр"], isPopular: true, sortOrder: 60 }),
  svc({ id: "serv-elektryka", name: "Електрика", slug: "elektryka", categoryId: "cat-sto-remont", keywords: ["стартер", "генератор", "проводка"], isPopular: true, sortOrder: 70 }),
  svc({ id: "serv-dvyhun-remont", name: "Ремонт двигуна", slug: "remont-dvyhuna", categoryId: "cat-sto-remont", keywords: ["двигун", "капремонт"], isPopular: false, sortOrder: 80 }),
  svc({ id: "serv-kpp", name: "КПП / трансмісія", slug: "kpp-transmisiia", categoryId: "cat-sto-remont", keywords: ["коробка", "зчеплення", "трансмісія"], isPopular: false, sortOrder: 90 }),
  svc({ id: "serv-vykhlop", name: "Вихлопна система", slug: "vykhlopna-systema", categoryId: "cat-sto-remont", keywords: ["глушник", "каталізатор"], isPopular: false, sortOrder: 100 }),
  svc({ id: "serv-rulove", name: "Рульове керування", slug: "rulove-keruvannia", categoryId: "cat-sto-remont", keywords: ["рейка", "гур", "егур"], isPopular: false, sortOrder: 110 }),
  svc({ id: "serv-rozval", name: "Розвал-сходження", slug: "rozval-shodzhennia", categoryId: "cat-sto-remont", keywords: ["розвал", "сходження"], isPopular: true, sortOrder: 120 }),

  // Детейлінг
  svc({ id: "serv-poliruvannia", name: "Полірування", slug: "poliruvannia", categoryId: "cat-detailing", keywords: ["поліроль", "кузов"], isPopular: true, sortOrder: 210 }),
  svc({ id: "serv-keramika", name: "Кераміка / віск", slug: "keramika-vosk", categoryId: "cat-detailing", keywords: ["кераміка", "віск", "захист"], isPopular: true, sortOrder: 220 }),
  svc({ id: "serv-khimchystka", name: "Хімчистка салону", slug: "khimchystka-salonu", categoryId: "cat-detailing", keywords: ["салон", "сидіння"], isPopular: true, sortOrder: 230 }),
  svc({ id: "serv-detail-myika", name: "Детейл-мійка", slug: "deteyl-myika", categoryId: "cat-detailing", keywords: ["мийка", "детейлінг"], isPopular: false, sortOrder: 240 }),
  svc({ id: "serv-antydoshch", name: "Антидощ", slug: "antydoshch", categoryId: "cat-detailing", keywords: ["лобове", "гідрофоб"], isPopular: false, sortOrder: 250 }),
  svc({ id: "serv-tonuvannia", name: "Тонування", slug: "tonuvannia", categoryId: "cat-detailing", keywords: ["тонування", "плівка"], isPopular: false, sortOrder: 260 }),

  // Шини / Диски
  svc({ id: "serv-shynomontazh", name: "Шиномонтаж", slug: "shynomontazh", categoryId: "cat-tyres", keywords: ["заміна коліс", "монтаж"], isPopular: true, sortOrder: 310 }),
  svc({ id: "serv-balansuvannia", name: "Балансування", slug: "balansuvannia", categoryId: "cat-tyres", keywords: ["вібрація", "баланс"], isPopular: true, sortOrder: 320 }),
  svc({ id: "serv-remont-shyn", name: "Ремонт шин", slug: "remont-shyn", categoryId: "cat-tyres", keywords: ["прокол", "латка"], isPopular: true, sortOrder: 330 }),
  svc({ id: "serv-pravka-dyskiv", name: "Правка дисків", slug: "pravka-dyskiv", categoryId: "cat-tyres", keywords: ["диски", "правка"], isPopular: false, sortOrder: 340 }),
  svc({ id: "serv-zberihannia-kolis", name: "Сезонне зберігання коліс", slug: "zberihannia-kolis", categoryId: "cat-tyres", keywords: ["зберігання шин"], isPopular: false, sortOrder: 350 }),

  // Кузов / фарбування
  svc({ id: "serv-kuzovni", name: "Кузовні роботи", slug: "kuzovni-roboty", categoryId: "cat-body-paint", keywords: ["рихтування", "кузов"], isPopular: true, sortOrder: 410 }),
  svc({ id: "serv-farbuvannia", name: "Фарбування", slug: "farbuvannia", categoryId: "cat-body-paint", keywords: ["фарба", "лак"], isPopular: true, sortOrder: 420 }),
  svc({ id: "serv-pdr", name: "PDR (видалення вм’ятин)", slug: "pdr", categoryId: "cat-body-paint", keywords: ["вм'ятини", "без фарбування"], isPopular: false, sortOrder: 430 }),
  svc({ id: "serv-pidbir-farby", name: "Підбір фарби", slug: "pidbir-farby", categoryId: "cat-body-paint", keywords: ["підбір кольору"], isPopular: false, sortOrder: 440 }),

  // Скло / світло
  svc({ id: "serv-zamina-skla", name: "Заміна скла", slug: "zamina-skla", categoryId: "cat-glass", keywords: ["лобове", "бокове", "заднє"], isPopular: true, sortOrder: 510 }),
  svc({ id: "serv-remont-skla", name: "Ремонт скла", slug: "remont-skla", categoryId: "cat-glass", keywords: ["сколи", "тріщина"], isPopular: true, sortOrder: 520 }),
  svc({ id: "serv-poliruvannia-far", name: "Полірування фар", slug: "poliruvannia-far", categoryId: "cat-glass", keywords: ["фари", "світло"], isPopular: false, sortOrder: 530 }),

  // Кондиціонери
  svc({ id: "serv-kondytsionery", name: "Кондиціонери", slug: "kondytsionery", categoryId: "cat-ac", keywords: ["клімат", "ac"], isPopular: true, sortOrder: 610 }),
  svc({ id: "serv-zapravka-ac", name: "Заправка кондиціонера", slug: "zapravka-kondytsionera", categoryId: "cat-ac", keywords: ["фреон", "заправка"], isPopular: true, sortOrder: 620 }),
  svc({ id: "serv-diah-ac", name: "Діагностика кондиціонера", slug: "diahnostyka-kondytsionera", categoryId: "cat-ac", keywords: ["ac діагностика", "витік"], isPopular: false, sortOrder: 630 }),
  svc({ id: "serv-remont-ac", name: "Ремонт кондиціонера", slug: "remont-kondytsionera", categoryId: "cat-ac", keywords: ["компресор", "радіатор"], isPopular: false, sortOrder: 640 })
].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

export const taxonomyServicesBySlug = new Map(taxonomyServices.map((item) => [item.slug, item]));
export const taxonomyCategoriesBySlug = new Map(serviceCategories.map((item) => [item.slug, item]));

// Domain model alias: existing partner_services table is the StationService link.
export type StationServiceLink = StationService;
