"use client"; // Mark as a Client Component
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";

interface AddVenueProps {
  onSuccess?: () => void; // Callback for successful venue addition
}

export default function AddVenue({ onSuccess }: AddVenueProps) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [media, setMedia] = useState<string[]>([]);

  const handleAddVenue = async () => {
    // Ensure the user is logged in
    if (!user) {
      toast.error("You must be logged in to add a venue.");
      return;
    }

    // Check user role (example: only allow admins or specific roles to add venues)
    const userRole = user.publicMetadata.role; // Assuming role is stored in publicMetadata
    if (userRole !== "admin") {
      toast.error("You do not have permission to add venues.");
      return;
    }

    // Validate form fields
    if (!name || !address || !city || !state || !description) {
      toast.error("Please fill out all required fields.");
      return;
    }

    // Insert the venue into Supabase
    const { data, error } = await supabase
      .from("venues")
      .insert([
        {
          name,
          description,
          address,
          city,
          state,
          country,
          media,
        },
      ])
      .select();

    if (error) {
      toast.error("Failed to add venue: " + error.message);
    } else {
      toast.success("Venue added successfully!");
      // Reset form fields
      setName("");
      setDescription("");
      setAddress("");
      setCity("");
      setState("");
      setCountry("");
      setMedia([]);

      // Trigger the onSuccess callback if provided
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Add Venue</h1>

      {/* Name Input */}
      <Input
        type="text"
        placeholder="Venue Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      {/* Description Textarea */}
      <Textarea
        placeholder="Describe the venue"
        value={name}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Address Input */}
      <Input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* City Input */}
      <Input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      {/* State Input */}
      <Input
        type="text"
        placeholder="State"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />

      {/* Country Input */}
      <Input
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />

      {/* Media Input (comma-separated URLs) */}
      <Input
        type="text"
        placeholder="Media URLs (comma-separated)"
        value={media.join(",")}
        onChange={(e) => setMedia(e.target.value.split(","))}
      />

      {/* Add Venue Button */}
      <Button onClick={handleAddVenue} className="w-full">
        Add Venue
      </Button>
    </div>
  );
}
