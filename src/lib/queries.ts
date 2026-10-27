import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Movie = Tables<"movies">;
export type Theatre = Tables<"theatres">;
export type Show = Tables<"shows">;

export const moviesQuery = queryOptions({
  queryKey: ["movies"],
  queryFn: async () => {
    const { data, error } = await supabase.from("movies").select("*").order("created_at");
    if (error) throw error;
    return data;
  },
});

export const movieQuery = (slug: string) =>
  queryOptions({
    queryKey: ["movie", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("movies").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

/** Upcoming shows for a movie (today onwards), with theatre names. */
export const showsQuery = (movieId: string) =>
  queryOptions({
    queryKey: ["shows", movieId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("shows")
        .select("*, theatres(id, name, location)")
        .eq("movie_id", movieId)
        .gte("show_date", today)
        .order("show_date")
        .order("show_time");
      if (error) throw error;
      return data;
    },
  });

export const bookedSeatsQuery = (showId: string) =>
  queryOptions({
    queryKey: ["booked-seats", showId],
    queryFn: async () => {
      const { data, error } = await supabase.from("booked_seats").select("seat_label").eq("show_id", showId);
      if (error) throw error;
      return new Set(data.map((d) => d.seat_label));
    },
  });

const bookingSelect = "*, shows(show_date, show_time, price, movies(title, slug, poster_url), theatres(name, location))";

export const myBookingsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["bookings", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(bookingSelect)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const bookingQuery = (reference: string) =>
  queryOptions({
    queryKey: ["booking", reference],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select(bookingSelect).eq("reference", reference).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export type BookingWithShow = NonNullable<Awaited<ReturnType<NonNullable<ReturnType<typeof bookingQuery>["queryFn"]>>>>;
