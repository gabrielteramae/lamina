export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function luhnOk(num: string) {
  if (!/^\d+$/.test(num)) return false;
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = num.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function cardBrand(number: string) {
  if (number.startsWith("4")) return "Visa";
  if (/^3[47]/.test(number)) return "Amex";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "Mastercard";
  if (number.startsWith("6")) return "Elo";
  return "Cartão";
}

export function groupCard(digits: string) {
  return digits
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function maskExpiry(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

const DECLINE = "4000000000000002";

export type CardCheck =
  | { ok: true; last4: string; brand: string }
  | { ok: false; error: string };

export function validateCard(
  input: { number: string; name: string; expiry: string; cvv: string },
  now = new Date(),
): CardCheck {
  const number = onlyDigits(input.number);
  if (number.length < 13 || number.length > 19 || !luhnOk(number)) {
    return { ok: false, error: "Número de cartão inválido." };
  }
  if (input.name.trim().length < 3) {
    return { ok: false, error: "Informe o nome impresso no cartão." };
  }
  const match = /^(\d{2})\/(\d{2})$/.exec(input.expiry.trim());
  if (!match) return { ok: false, error: "Validade no formato MM/AA." };
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return { ok: false, error: "Mês de validade inválido." };
  const expires = new Date(year, month, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (expires <= thisMonth) return { ok: false, error: "Cartão vencido." };
  const brand = cardBrand(number);
  const cvv = onlyDigits(input.cvv);
  const cvvLen = brand === "Amex" ? 4 : 3;
  if (cvv.length !== cvvLen) {
    return { ok: false, error: `CVV deve ter ${cvvLen} dígitos.` };
  }
  if (number === DECLINE) {
    return { ok: false, error: "A operadora recusou este cartão. Tente outro número." };
  }
  return { ok: true, last4: number.slice(-4), brand };
}

export function pixPayload(code: string, cents: number) {
  const amount = (cents / 100).toFixed(2);
  return `DEMO-LAMINA|PIX|${code}|BRL${amount}|LAMINA BARBEARIA|PINHEIROS|NAO COBRA`;
}
