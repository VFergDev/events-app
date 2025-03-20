import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import RSVP from "../../../components/RSVP";
import { Key } from "react";

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string; // Venue ID
  media: string[]; // Array of media URLs
}

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export default async function EventPage({
  params,
}: {
  params: { eventId: string };
}) {
  // Await params to ensure it's resolved
  const { eventId } = await params;

  if (!eventId) {
    return <div>Error: Event ID is missing.</div>;
  }

  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId) // Use the resolved eventId
    .single();

  if (eventError) {
    console.error("Error fetching event:", eventError);
    return <div>Error loading event details.</div>;
  }

  // Fetch venue details
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("*")
    .eq("id", event.location)
    .single();

  if (venueError) {
    console.error("Error fetching venue:", venueError);
    return <div>Error loading venue details.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
      <p className="text-gray-600 mb-4">
        <strong>Date & Time:</strong>{" "}
        {new Date(event.start_time).toLocaleString()} -{" "}
        {new Date(event.end_time).toLocaleTimeString()}
      </p>
      <p className="mb-4">{event.description}</p>
      <p className="text-sm text-gray-600 mb-4">
        <strong>Location:</strong>{" "}
        <Link href={`/venues/${venue.id}`} className="hover:underline">
          {venue.name}, {venue.city}, {venue.state}, {venue.country}
        </Link>
      </p>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">RSVP</h2>
        <RSVP eventId={eventId} />
      </div>
      <Link href="/" className="text-blue-600 hover:underline mt-4 block">
        &larr; Back to Events
      </Link>
    </div>
  );
}
