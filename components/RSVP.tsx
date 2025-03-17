"use client"; // Mark as a Client Component
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface RSVPProps {
  eventId: string; // The ID of the event being RSVP'd for
}

export default function RSVP({ eventId }: RSVPProps) {
  const { user } = useUser();
  const [futureUpdates, setFutureUpdates] = useState(true);

  const handleRSVP = async () => {
    if (!user) {
      toast.error("You must be logged in to RSVP.");
      return;
    }

    // Populate RSVP data from Clerk user info
    const rsvpData = {
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      email: user.primaryEmailAddress?.emailAddress || "",
      phone: user.phoneNumbers[0]?.phoneNumber || "",
      future_updates: futureUpdates,
      user_id: user.id,
      event_id: eventId,
    };

    // Insert RSVP into Supabase
    const { error } = await supabase.from("rsvp").insert([rsvpData]);

    if (error) {
      toast.error("Failed to RSVP: " + error.message);
    } else {
      toast.success("You have successfully RSVP'd!");
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={futureUpdates}
          onChange={(e) => setFutureUpdates(e.target.checked)}
        />
        <span>Receive future updates about this event</span>
      </label>
      <Button onClick={handleRSVP} className="w-full">
        RSVP
      </Button>
    </div>
  );
}
