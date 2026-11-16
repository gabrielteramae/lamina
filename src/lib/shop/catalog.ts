import type { Barber, DayHours, Service } from "@/lib/shop/types";

export const SHOP = {
  name: "Lâmina",
  neighborhood: "Pinheiros",
  city: "São Paulo",
  address: "Rua dos Pinheiros, 418",
  phone: "(11) 3090-4418",
  phoneHref: "tel:+551130904418",
  maps: "https://www.google.com/maps/search/?api=1&query=Rua%20dos%20Pinheiros%20418%20S%C3%A3o%20Paulo",
};

export const SERVICES: Service[] = [
  {
    id: "corte",
    name: "Corte clássico",
    detail: "Tesoura e máquina, acabamento na nuca",
    minutes: 45,
    priceCents: 7500,
    active: true,
  },
  {
    id: "degrade",
    name: "Degradê",
    detail: "Transição baixa ou média, com desenho",
    minutes: 50,
    priceCents: 9000,
    active: true,
  },
  {
    id: "barba",
    name: "Barba",
    detail: "Toalha quente, navalha e balm",
    minutes: 30,
    priceCents: 5500,
    active: true,
  },
  {
    id: "combo",
    name: "Corte e barba",
    detail: "Os dois no mesmo horário",
    minutes: 75,
    priceCents: 13000,
    active: true,
  },
  {
    id: "navalha",
    name: "Barba na navalha",
    detail: "Contorno preciso e pele alinhada",
    minutes: 40,
    priceCents: 8500,
    active: true,
  },
];

export const BARBERS: Barber[] = [
  { id: "rafael", name: "Rafael Moura", role: "Cortes clássicos", active: true },
  { id: "caio", name: "Caio Lins", role: "Degradê e desenho", active: true },
  { id: "helena", name: "Helena Viana", role: "Barba e navalha", active: true },
];

export const HOURS: DayHours[] = [
  { day: 0, closed: false, open: "11:00", close: "16:00" },
  { day: 1, closed: true, open: "10:00", close: "20:00" },
  { day: 2, closed: false, open: "10:00", close: "20:00" },
  { day: 3, closed: false, open: "10:00", close: "20:00" },
  { day: 4, closed: false, open: "10:00", close: "20:00" },
  { day: 5, closed: false, open: "10:00", close: "20:00" },
  { day: 6, closed: false, open: "09:00", close: "18:00" },
];

export const SLOT_MINUTES = 30;
