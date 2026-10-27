export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const formatDuration = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

export const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export const formatTime = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ampm}`;
};

/** Seat layout: rows A–H, 12 seats per row. */
export const SEAT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const SEATS_PER_ROW = 12;
export const MAX_SEATS = 10;

export const calcTotal = (seatCount: number, price: number) => seatCount * price;

/** Toggle a seat in the selection. Booked seats and over-limit picks are ignored. */
export function toggleSeat(selected: string[], seat: string, booked: Set<string>, max = MAX_SEATS) {
  if (booked.has(seat)) return selected;
  if (selected.includes(seat)) return selected.filter((s) => s !== seat);
  if (selected.length >= max) return selected;
  return [...selected, seat];
}
