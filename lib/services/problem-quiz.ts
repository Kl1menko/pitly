export type QuizSymptomKey =
  | "suspension-noise"
  | "brakes"
  | "no-start"
  | "smoke-smell"
  | "ac"
  | "vibration"
  | "other";

export const quizSymptoms: {
  key: QuizSymptomKey;
  label: string;
  shortHint: string;
  serviceSlugs: string[];
  followupLabel: string;
}[] = [
  {
    key: "suspension-noise",
    label: "Стуки / підвіска",
    shortHint: "Шум на ямах, стуки спереду/ззаду",
    serviceSlugs: ["diagnostyka", "khodova", "pidviska-servis"],
    followupLabel: "Коли з’являється шум (ями, поворот, гальмування)?"
  },
  {
    key: "brakes",
    label: "Гальма",
    shortHint: "Скрип, б’є педаль, збільшився шлях",
    serviceSlugs: ["halma", "diagnostyka"],
    followupLabel: "Що саме відчуваєте: скрип, вібрація, м’яка педаль?"
  },
  {
    key: "no-start",
    label: "Не заводиться",
    shortHint: "Стартер крутить/не крутить, помилки",
    serviceSlugs: ["diagnostyka", "elektryka", "remont-dvyhuna"],
    followupLabel: "Що відбувається при запуску: крутить, клацає, тиша?"
  },
  {
    key: "smoke-smell",
    label: "Дим / запах",
    shortHint: "Запах палива/масла, дим із вихлопу",
    serviceSlugs: ["diagnostyka", "remont-dvyhuna", "vykhlopna-systema"],
    followupLabel: "Який запах/дим і коли з’являється?"
  },
  {
    key: "ac",
    label: "Кондиціонер",
    shortHint: "Не холодить, шумить, запах",
    serviceSlugs: ["zapravka-kondytsionera", "diahnostyka-kondytsionera", "remont-kondytsionera"],
    followupLabel: "Кондиціонер не холодить чи є шум/запах?"
  },
  {
    key: "vibration",
    label: "Вібрація на швидкості",
    shortHint: "Вібрація керма/кузова на певній швидкості",
    serviceSlugs: ["balansuvannia", "shynomontazh", "rozval-shodzhennia", "khodova"],
    followupLabel: "На якій швидкості та де відчувається вібрація?"
  },
  {
    key: "other",
    label: "Інше",
    shortHint: "Опишіть проблему своїми словами",
    serviceSlugs: ["diagnostyka"],
    followupLabel: "Коротко опишіть, що турбує"
  }
];

export function getQuizSymptom(key?: string | null) {
  return quizSymptoms.find((item) => item.key === key) ?? null;
}
