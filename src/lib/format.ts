export const formatPrice = (n: number): string => {
  return `${n.toLocaleString("ru-RU")} ₽`;
};

export const formatDate = (ts: number): string => {
  const d = new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateTime = (ts: number): string => {
  const d = new Date(ts);
  return d.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

export const cls = (...args: Array<string | false | null | undefined>): string =>
  args.filter(Boolean).join(" ");
