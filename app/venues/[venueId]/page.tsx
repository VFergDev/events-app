import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string; // Venue ID
}

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export default async function VenuePage({
  params,
}: {
  params: { venueId: string };
}) {
  // Fetch venue details
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("*")
    .eq("id", params.venueId)
    .single();

  if (venueError) {
    console.error("Error fetching venue:", venueError);
    return <div>Error loading venue details.</div>;
  }

  // Fetch upcoming events for this venue
  const now = new Date().toISOString();
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("location", params.venueId)
    .gt("start_time", now) // Only fetch events in the future
    .order("start_time", { ascending: true }); // Sort by start time

  if (eventsError) {
    console.error("Error fetching events:", eventsError);
    return <div>Error loading events.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{venue.name}</h1>
      <p className="text-gray-600 mb-4">
        {venue.city}, {venue.state}, {venue.country}
      </p>

      <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold">
                <Link href={`/events/${event.id}`} className="hover:underline">
                  {event.title}
                </Link>
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(event.start_time).toLocaleString()}
              </p>
              <p className="mt-2">{event.description}</p>
            </div>
          ))
        ) : (
          <p>No upcoming events at this venue.</p>
        )}
      </div>
    </div>
  );
}
