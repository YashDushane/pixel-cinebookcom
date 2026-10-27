import avatar from "@/assets/posters/avatar-way-of-water.jpg";
import interstellar from "@/assets/posters/interstellar.jpg";
import inception from "@/assets/posters/inception.jpg";

// Local poster images for the sample movies (looked up by movie slug).
// Movies without an image here use poster_url from the database, or a placeholder.
const localPosters: Record<string, string> = {
  "avatar-way-of-water": avatar,
  interstellar,
  inception,
};

export function posterFor(slug: string, posterUrl?: string | null): string | null {
  return posterUrl || localPosters[slug] || null;
}
