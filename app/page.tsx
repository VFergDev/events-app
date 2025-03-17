"use client"; // Mark as a Client Component
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthButtons from "../components/AuthButtons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import Link from "next/link";

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

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  // Fetch events and venues
  useEffect(() => {
    const fetchData = async () => {
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*");
      if (eventsError) {
        console.error("Error fetching events:", eventsError);
      } else {
        setEvents(eventsData);
      }

      // Fetch venues
      const { data: venuesData, error: venuesError } = await supabase
        .from("venues")
        .select("*");
      if (venuesError) {
        console.error("Error fetching venues:", venuesError);
      } else {
        setVenues(venuesData);
      }
    };

    fetchData();
  }, []);

  // Get venue details by ID
  const getVenueDetails = (venueId: string) => {
    const venue = venues.find((venue) => venue.id === venueId);
    return venue
      ? `${venue.name}, ${venue.city}, ${venue.state}, ${venue.country}`
      : "Location not found";
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      <AuthButtons />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/events/${event.id}`} className="hover:underline">
                  {event.title}
                </Link>
              </CardTitle>
              <CardDescription>
                {new Date(event.start_time).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{event.description}</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Location:</strong>{" "}
                <Link
                  href={`/venues/${event.location}`}
                  className="hover:underline"
                >
                  {getVenueDetails(event.location)}
                </Link>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
