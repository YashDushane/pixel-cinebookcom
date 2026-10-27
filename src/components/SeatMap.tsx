import { SEAT_ROWS, SEATS_PER_ROW } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Visual cinema seat layout. Green = available, yellow = selected, red = booked. */
export function SeatMap({
  booked,
  selected,
  onToggle,
}: {
  booked: Set<string>;
  selected: string[];
  onToggle: (seat: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="mx-auto w-fit min-w-[520px] space-y-2 p-2">
        <div className="mx-auto mb-8 h-3 w-4/5 bg-foreground/80 screen-curve" />
        <p className="-mt-6 mb-6 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground">Screen</p>
        {SEAT_ROWS.map((row) => (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-5 text-sm text-muted-foreground">{row}</span>
            {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
              const seat = `${row}${i + 1}`;
              const isBooked = booked.has(seat);
              const isSelected = selected.includes(seat);
              return (
                <button
                  key={seat}
                  type="button"
                  disabled={isBooked}
                  onClick={() => onToggle(seat)}
                  aria-label={`Seat ${seat}${isBooked ? " booked" : isSelected ? " selected" : ""}`}
                  title={seat}
                  className={cn(
                    "h-8 w-8 rounded-t-lg text-[10px] font-semibold text-background transition hover:scale-110",
                    i === 5 && "mr-4",
                    isBooked && "cursor-not-allowed bg-seat-booked opacity-80 hover:scale-100",
                    isSelected && "bg-seat-selected",
                    !isBooked && !isSelected && "bg-seat-available",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-6 pt-4 text-sm">
          <Legend className="bg-seat-available" label="Available" />
          <Legend className="bg-seat-selected" label="Selected" />
          <Legend className="bg-seat-booked" label="Booked" />
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return <span className="flex items-center gap-2"><span className={cn("h-4 w-4 rounded", className)} />{label}</span>;
}
