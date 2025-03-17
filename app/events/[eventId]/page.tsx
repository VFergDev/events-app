import RSVP from "@/components/RSVP";

export default function EventPage({ params }: { params: { eventId: string } }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Event Details</h1>
      {/* Display event details here */}
      <RSVP eventId={params.eventId} />
    </div>
  );
}
