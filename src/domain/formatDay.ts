const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDay(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
