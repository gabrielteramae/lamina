export type Service = {
  id: string;
  name: string;
  detail: string;
  minutes: number;
  priceCents: number;
  active: boolean;
};

export type Barber = {
  id: string;
  name: string;
  role: string;
  active: boolean;
};

export type DayHours = {
  day: number;
  closed: boolean;
  open: string;
  close: string;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type PayMethod = "pix" | "card" | "shop";

export type PayStatus = "pending" | "paid" | "refunded" | "declined";

export type Booking = {
  id: string;
  code: string;
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  minutes: number;
  priceCents: number;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  payMethod: PayMethod;
  payStatus: PayStatus;
  cardLast4?: string;
  cardBrand?: string;
  createdAt: string;
};

export type BookInput = {
  serviceId: string;
  barberId: string | null;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  payMethod: PayMethod;
  payStatus: PayStatus;
  cardLast4?: string;
  cardBrand?: string;
};
