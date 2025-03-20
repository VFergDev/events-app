import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient"; // Adjust the path to your Supabase client

interface RSVPFormProps {
  eventId: number;
}

export function RSVPForm({ eventId }: RSVPFormProps) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    futureUpdates: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to RSVP.");
      return;
    }

    const { data, error } = await supabase.from("rsvp").insert([
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        future_updates: formData.futureUpdates,
        user_id: user.id,
        event_id: eventId,
      },
    ]);

    if (error) {
      console.error("Error submitting RSVP:", error);
      alert("Failed to submit RSVP. Please try again.");
    } else {
      alert("RSVP submitted successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone: "",
        futureUpdates: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.futureUpdates}
            onChange={(e) =>
              setFormData({ ...formData, futureUpdates: e.target.checked })
            }
          />
          Receive future updates
        </label>
      </div>
      <button type="submit">Submit RSVP</button>
    </form>
  );
}
