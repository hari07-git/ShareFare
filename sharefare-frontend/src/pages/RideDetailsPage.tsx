import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { MapPicker } from "../components/MapPicker";
import { PageHeader } from "../components/PageHeader";

type Ride = {
  id: number;
  driverEmail: string;
  driverName: string;
  driverPhone: string | null;
  origin: string;
  destination: string;
  originLat: number | null;
  originLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  departureTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  pricePerSeat: number;
  status: string;
};

type BookingResponse = {
  bookingId: number;
  rideId: number;
  seatsBooked: number;
  status: string;
  createdAt: string;
};

type Review = {
  id: number;
  rideId: number;
  reviewerEmail: string;
  revieweeEmail: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export function RideDetailsPage() {
  const { rideId } = useParams();
  const [ride, setRide] = useState<Ride | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seats, setSeats] = useState(1);
  const [revieweeEmail, setRevieweeEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const auth = useAuth();

  async function load() {
    if (!rideId) return;
    setError(null);
    try {
      const [rideRes, reviewRes] = await Promise.all([
        api.get<Ride>(`/api/rides/${rideId}`),
        api.get<Review[]>(`/api/rides/${rideId}/reviews`)
      ]);
      setRide(rideRes.data);
      setReviews(reviewRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load ride");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideId]);

  async function book() {
    if (!rideId) return;
    setError(null);
    try {
      const res = await api.post<BookingResponse>(`/api/rides/${rideId}/bookings`, { seats });
      setError(`Booked! bookingId=${res.data.bookingId}`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Booking failed");
    }
  }

  async function submitReview() {
    if (!rideId) return;
    setError(null);
    try {
      await api.post(`/api/rides/${rideId}/reviews`, {
        revieweeEmail,
        rating,
        comment: comment.trim() ? comment.trim() : null
      });
      setRevieweeEmail("");
      setRating(5);
      setComment("");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Review failed");
    }
  }

  if (!ride) {
    return (
      <div className="space-y-3">
        {error ? <div className="text-sm text-rose-300">{error}</div> : <div className="text-sm text-slate-300/90">Loading...</div>}
        <Link className="underline text-sm" to="/rides/find">Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ride details"
        subtitle="See route info, pins, bookings, and reviews."
        imageUrl="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="Ride details">
        <div className="grid gap-2 text-sm">
          <div>
            <span className="font-medium">Route:</span> {ride.origin} → {ride.destination}
          </div>
          <div>
            <span className="font-medium">Departure:</span> {new Date(ride.departureTime).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Driver:</span> {ride.driverName} ({ride.driverEmail})
          </div>
          {ride.driverPhone ? (
            <div>
              <span className="font-medium">Driver phone:</span> {ride.driverPhone}
            </div>
          ) : null}
          <div>
            <span className="font-medium">Seats:</span> {ride.seatsAvailable}/{ride.seatsTotal} • <span className="font-medium">Price:</span> ₹{ride.pricePerSeat}
          </div>
          <div>
            <span className="font-medium">Status:</span> {ride.status}
          </div>
        </div>
        {error ? <div className="mt-4 text-sm text-rose-300">{error}</div> : null}
      </Card>

      {(ride.originLat && ride.originLng) || (ride.destinationLat && ride.destinationLng) ? (
        <Card title="Map pins">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-medium text-slate-700">Pickup</div>
              <MapPicker
                value={ride.originLat && ride.originLng ? { lat: ride.originLat, lng: ride.originLng } : null}
                onChange={() => {}}
                readOnly
                height={240}
                center={
                  ride.originLat && ride.originLng
                    ? { lat: ride.originLat, lng: ride.originLng }
                    : { lat: 17.385, lng: 78.4867 }
                }
                zoom={13}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-slate-700">Drop</div>
              <MapPicker
                value={
                  ride.destinationLat && ride.destinationLng
                    ? { lat: ride.destinationLat, lng: ride.destinationLng }
                    : null
                }
                onChange={() => {}}
                readOnly
                height={240}
                center={
                  ride.destinationLat && ride.destinationLng
                    ? { lat: ride.destinationLat, lng: ride.destinationLng }
                    : { lat: 17.385, lng: 78.4867 }
                }
                zoom={13}
              />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-600">
            Pins are optional and currently set by the driver when offering a ride.
          </div>
        </Card>
      ) : null}

      <Card title="Book this ride">
        {!auth.token ? (
          <div className="text-sm text-slate-700">
            Please <Link className="underline" to="/auth/login">login</Link> to book.
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <FormField label="Seats">
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={seats}
                  onChange={(e) => setSeats(parseInt(e.target.value || "1", 10))}
                />
              </FormField>
            </div>
            <Button onClick={book}>Book</Button>
          </div>
        )}
      </Card>

      <Card title="Ratings & reviews">
        {reviews.length === 0 ? <div className="text-sm text-slate-600">No reviews yet.</div> : null}
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="font-medium">
                  {r.reviewerEmail} → {r.revieweeEmail}
                </div>
                <div className="text-slate-600">Rating: {r.rating}/5</div>
              </div>
              {r.comment ? <div className="mt-2 text-sm text-slate-700">{r.comment}</div> : null}
              <div className="mt-2 text-xs text-slate-500">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {auth.token ? (
          <div className="mt-6 space-y-3">
            <div className="text-sm font-medium">Leave a review</div>
            <div className="grid gap-3 md:grid-cols-3">
              <FormField label="Reviewee email">
                <Input value={revieweeEmail} onChange={(e) => setRevieweeEmail(e.target.value)} type="email" />
              </FormField>
              <FormField label="Rating (1-5)">
                <Input value={rating} onChange={(e) => setRating(parseInt(e.target.value || "5", 10))} type="number" min={1} max={5} />
              </FormField>
              <FormField label="Comment (optional)">
                <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Good ride!" />
              </FormField>
            </div>
            <Button onClick={submitReview}>Submit review</Button>
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-700">
            <Link className="underline" to="/auth/login">Login</Link> to review.
          </div>
        )}
      </Card>
    </div>
  );
}
