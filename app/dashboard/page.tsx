"use client"; // Mark as a Client Component
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  location: string; // Venue ID
}

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export default function Dashboard() {
  const { user } = useUser();
  const [rsvpEvents, setRsvpEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  // Fetch RSVP'd events and venues
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch RSVP'd events for the user
      const { data: rsvpData, error: rsvpError } = await supabase
        .from("rsvp")
        .select("event_id")
        .eq("user_id", user.id);

      if (rsvpError) {
        console.error("Error fetching RSVPs:", rsvpError);
        return;
      }

      // Fetch event details for RSVP'd events
      const eventIds = rsvpData.map((rsvp) => rsvp.event_id);
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
      } else {
        setRsvpEvents(eventsData);
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
  }, [user]);

  // Get venue details by ID
  const getVenueDetails = (venueId: string) => {
    const venue = venues.find((venue) => venue.id === venueId);
    return venue
      ? `${venue.name}, ${venue.city}, ${venue.state}, ${venue.country}`
      : "Location not found";
  };

  // Separate events into upcoming and past
  const now = new Date();
  const upcomingEvents = rsvpEvents.filter(
    (event) => new Date(event.start_time) > now
  );
  const pastEvents = rsvpEvents.filter(
    (event) => new Date(event.start_time) <= now
  );

  // Sort events by date (closest first)
  upcomingEvents.sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  pastEvents.sort(
    (a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your RSVP'd Events</h1>

      {/* Upcoming Events */}
      <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {upcomingEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                {new Date(event.start_time).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{event.description}</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Location:</strong> {getVenueDetails(event.location)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Past Events */}
      <h2 className="text-xl font-semibold mb-2">Past Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pastEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                {new Date(event.start_time).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{event.description}</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Location:</strong> {getVenueDetails(event.location)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
