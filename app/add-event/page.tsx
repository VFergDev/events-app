"use client"; // Mark as a Client Component
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Input } from "../../components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export default function AddEvent() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null); // Track selected venue ID
  const [venues, setVenues] = useState<Venue[]>([]);

  // Fetch venues from the venue table
  useEffect(() => {
    const fetchVenues = async () => {
      const { data, error } = await supabase.from("venues").select("*");
      if (error) {
        console.error("Error fetching venues:", error);
      } else {
        setVenues(data);
      }
    };

    fetchVenues();
  }, []);

  // Get the selected venue's name for display
  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId);

  const handleAddEvent = async () => {
    // Ensure the user is logged in
    if (!user) {
      toast.error("You must be logged in to add an event.");
      return;
    }

    // Check user role (example: only allow admins or specific roles to add events)
    const userRole = user.publicMetadata.role; // Assuming role is stored in publicMetadata
    if (userRole !== "admin") {
      toast.error("You do not have permission to add events.");
      return;
    }

    // Validate form fields
    if (
      !date ||
      !startTime ||
      !endTime ||
      !title ||
      !description ||
      !selectedVenueId
    ) {
      toast.error("Please fill out all fields.");
      return;
    }

    // Combine date and time into ISO strings
    const startDateTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${startTime}:00`
    ).toISOString();
    const endDateTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${endTime}:00`
    ).toISOString();

    // Insert the event into Supabase
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          title,
          description,
          start_time: startDateTime,
          end_time: endDateTime,
          media,
          location: selectedVenueId, // Use the venue ID for the location
        },
      ])
      .select();

    if (error) {
      toast.error("Failed to add event: " + error.message);
    } else {
      toast.success("Event added successfully!");
      // Reset form fields
      setTitle("");
      setDescription("");
      setDate(new Date());
      setStartTime("");
      setEndTime("");
      setMedia([]);
      setSelectedVenueId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Add Event</h1>

      {/* Title Input */}
      <Input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />

      {/* Description Input */}
      <Input
        type="text"
        placeholder="Event Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4"
      />

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full mb-4">
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Start Time Input */}
      <Input
        type="time"
        placeholder="Start Time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="mb-4"
      />

      {/* End Time Input */}
      <Input
        type="time"
        placeholder="End Time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="mb-4"
      />

      {/* Location Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mb-4 justify-start">
            {selectedVenue ? selectedVenue.name : "Select a venue"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]">
          {venues.map((venue) => (
            <DropdownMenuItem
              key={venue.id}
              onSelect={() => setSelectedVenueId(venue.id)} // Set the venue ID
            >
              {venue.name} - {venue.city}, {venue.state}, {venue.country}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Media Input (comma-separated URLs) */}
      <Input
        type="text"
        placeholder="Media URLs (comma-separated)"
        value={media.join(",")}
        onChange={(e) => setMedia(e.target.value.split(","))}
        className="mb-4"
      />

      {/* Add Event Button */}
      <Button onClick={handleAddEvent} className="w-full">
        Add Event
      </Button>
    </div>
  );
}
