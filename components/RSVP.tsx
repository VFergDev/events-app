"use client"; // Mark as a Client Component
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";

interface RSVPProps {
  eventId: string; // The ID of the event being RSVP'd for
}

export default function RSVP({ eventId }: RSVPProps) {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || ""
  );
  const [phone, setPhone] = useState(user?.phoneNumbers[0]?.phoneNumber || "");
  const [futureUpdates, setFutureUpdates] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleRSVP = async () => {
    if (!user) {
      toast.error("You must be logged in to RSVP.");
      return;
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      toast.error("Please fill out all required fields.");
      setIsEditing(true); // Show the form for editing
      return;
    }

    // Populate RSVP data
    const rsvpData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone, // Set phone to null if empty
      future_updates: futureUpdates,
      user_id: user.id,
      event_id: eventId,
    };

    // Insert RSVP into Supabase
    const { error } = await supabase.from("rsvps").insert([rsvpData]);

    if (error) {
      toast.error("Failed to RSVP: " + error.message);
    } else {
      toast.success("You have successfully RSVP'd!");
    }

    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setFutureUpdates(true); // Reset the checkbox to its default state
  };

  return (
    <div className="space-y-4">
      {/* Display user info or allow editing */}
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

      {/* Future Updates Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox  />
        <input
          type="checkbox"
          checked={futureUpdates}
          onChange={(e) => setFutureUpdates(e.target.checked)}
        />
        <span>Receive future updates about this event</span>
      </div>

      {/* RSVP Button */}
      <Button onClick={handleRSVP} className="w-full">
        RSVP
      </Button>
    </div>
  );
}
