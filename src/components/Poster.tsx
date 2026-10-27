import { useState } from "react";
import { Film } from "lucide-react";
import { posterFor } from "@/lib/posters";
import { cn } from "@/lib/utils";

/** Movie poster with a placeholder if there is no image or it fails to load. */
export function Poster({
  slug,
  title,
  posterUrl,
  className,
}: {
  slug: string;
  title: string;
  posterUrl?: string | null;
  className?: string;
}) {
  const src = posterFor(slug, posterUrl);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "bg-poster-fallback flex aspect-[2/3] flex-col items-center justify-center gap-3 p-4 text-center",
          className,
        )}
      >
        <Film className="h-10 w-10 text-primary" />
        <span className="font-display text-2xl leading-tight">{title}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`${title} poster`}
      loading="lazy"
      width={768}
      height={1152}
      onError={() => setFailed(true)}
      className={cn("aspect-[2/3] w-full object-cover", className)}
    />
  );
}
