import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./GuestPortal.css";

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface Room {
  id: number;
  roomNumber: number | string;
  roomType: string;
  price: number;
  status: string;
}

interface Booking {
  id: number;
  checkIn: string;
  checkOut: string;
  status: string;
  adults: number;
  children: number;
  customer?: Customer;
  rooms?: Room[];
  // Compatibility with older API responses that return a single room.
  room?: Room | null;
}

interface BookingsProps {
  onBackToDashboard?: () => void;
  initialRoomId?: number;
  onInitialRoomHandled?: () => void;
}

interface BookingTokenPayload {
  role?: string;
  roles?: string[];
  sub?: string;
  email?: string;
  username?: string;
}

function readTokenPayload(): BookingTokenPayload {
  const token = localStorage.getItem("token");
  if (!token) return {};

  try {
    const payload = token.split(".")[1];
    return JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as BookingTokenPayload;
  } catch {
    return {};
  }
}

function normalizeBooking(booking: Booking): Booking {
  if (Array.isArray(booking.rooms)) {
    return booking;
  }

  return {
    ...booking,
    rooms: booking.room ? [booking.room] : [],
  };
}

function Bookings({
  onBackToDashboard,
  initialRoomId,
  onInitialRoomHandled,
}: BookingsProps) {
  const tokenPayload = readTokenPayload();
  const userRole = (
    tokenPayload.role ||
    tokenPayload.roles?.[0] ||
    "USER"
  ).toUpperCase();
  const isAdmin = userRole === "ADMIN";

  const currentUserEmail = (
    tokenPayload.email ||
    tokenPayload.sub ||
    tokenPayload.username ||
    localStorage.getItem("userEmail") ||
    localStorage.getItem("email") ||
    ""
  ).toLowerCase();

  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([""]);
  const [status, setStatus] = useState("CONFIRMED");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestRooms, setGuestRooms] = useState(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  const selectedRooms = useMemo(
    () =>
      selectedRoomIds
        .map((id) => rooms.find((room) => String(room.id) === id))
        .filter((room): room is Room => Boolean(room)),
    [selectedRoomIds, rooms]
  );

  const getBookingRooms = (booking: Booking): Room[] =>
    normalizeBooking(booking).rooms ?? [];

  const getTotalPrice = (booking: Booking): number =>
    getBookingRooms(booking).reduce(
      (total, room) => total + Number(room.price || 0),
      0
    );

  // --------------------------------------------------
  // LOAD BOOKINGS, CUSTOMERS AND ROOMS
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("You are not logged in. Please sign in again.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const [bookingResponse, customerResponse, roomResponse] =
        await Promise.all([
          fetch("http://localhost:8080/api/bookings", { headers }),
          fetch("http://localhost:8080/api/customers", { headers }),
          fetch("http://localhost:8080/api/rooms", { headers }),
        ]);

      if (
        !bookingResponse.ok ||
        !customerResponse.ok ||
        !roomResponse.ok
      ) {
        throw new Error(
          "Failed to load bookings. Check that the backend is running and your session is valid."
        );
      }

      const [bookingData, customerData, roomData] = await Promise.all([
        bookingResponse.json(),
        customerResponse.json(),
        roomResponse.json(),
      ]);

      if (
        !Array.isArray(bookingData) ||
        !Array.isArray(customerData) ||
        !Array.isArray(roomData)
      ) {
        throw new Error("The server returned an unexpected response.");
      }

      const normalizedBookings = (bookingData as Booking[]).map(normalizeBooking);
      const customerList = customerData as Customer[];
      const roomList = roomData as Room[];

      const currentCustomer = customerList.find(
        (customer) => customer.email?.toLowerCase() === currentUserEmail
      );

      setBookings(
        isAdmin
          ? normalizedBookings
          : currentUserEmail
            ? normalizedBookings.filter(
                (booking) =>
                  booking.customer?.email?.toLowerCase() === currentUserEmail
              )
            : []
      );

      setCustomers(customerList);
      setRooms(roomList);

      if (!isAdmin) {
        setCustomerId(currentCustomer ? String(currentCustomer.id) : "");
      }
    } catch (loadError) {
      console.error("Load bookings error:", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load booking data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    if (initialRoomId !== undefined) {
      setSelectedRoomIds([String(initialRoomId)]);
      setGuestRooms(1);
      setShowForm(true);
      onInitialRoomHandled?.();
    }
    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // FORM HELPERS
  // --------------------------------------------------

  const resetForm = () => {
    setCheckIn("");
    setCheckOut("");
    setCustomerId((current) => (isAdmin ? "" : current));
    setSelectedRoomIds([""]);
    setStatus("CONFIRMED");
    setAdults(2);
    setChildren(0);
    setGuestRooms(1);
    setEditingBooking(null);
    setShowForm(false);
    setShowGuestDropdown(false);
    setError("");
  };

  const openAddForm = () => {
    setEditingBooking(null);
    setCheckIn("");
    setCheckOut("");
    setCustomerId((current) => (isAdmin ? "" : current));
    setSelectedRoomIds(
      initialRoomId !== undefined ? [String(initialRoomId)] : [""]
    );
    setStatus("CONFIRMED");
    setAdults(2);
    setChildren(0);
    setGuestRooms(1);
    setShowGuestDropdown(false);
    setError("");
    setShowForm(true);
  };

  const resizeRoomSelection = (count: number) => {
    const safeCount = Math.max(1, Math.min(10, count));
    setGuestRooms(safeCount);
    setSelectedRoomIds((current) =>
      Array.from(
        { length: safeCount },
        (_, index) => current[index] ?? ""
      )
    );
  };

  const setRoomAtIndex = (index: number, value: string) => {
    setSelectedRoomIds((current) =>
      current.map((id, roomIndex) => (roomIndex === index ? value : id))
    );
  };

  const validateForm = (): boolean => {
    if (isAdmin && !customerId) {
      setError("Please select a customer.");
      return false;
    }

    if (selectedRoomIds.length === 0 || selectedRoomIds.some((id) => !id)) {
      setError("Please select a room for every room selection.");
      return false;
    }

    if (new Set(selectedRoomIds).size !== selectedRoomIds.length) {
      setError("Please select a different room for each selection.");
      return false;
    }

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      return false;
    }

    if (checkIn < today) {
      setError("Check-in date cannot be in the past.");
      return false;
    }

    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return false;
    }

    if (adults < 1) {
      setError("At least one adult is required.");
      return false;
    }

    if (children < 0) {
      setError("Children cannot be negative.");
      return false;
    }

    return true;
  };

  const createPayload = () => ({
    ...(editingBooking ? { id: editingBooking.id } : {}),
    checkIn,
    checkOut,
    status,
    adults,
    children,
    ...(customerId ? { customer: { id: Number(customerId) } } : {}),
    rooms: selectedRoomIds.map((id) => ({ id: Number(id) })),
  });

  // --------------------------------------------------
  // CREATE BOOKING
  // --------------------------------------------------

  const addBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) return;

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload()),
      });

      if (!response.ok) {
        const message = await response.text();
        console.error("Create booking response:", message);
        throw new Error(message || "Booking failed.");
      }

      resetForm();
      await loadData();
    } catch (saveError) {
      console.error("Add booking error:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to create booking. Check room availability and dates."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // EDIT BOOKING
  // --------------------------------------------------

  const startEdit = (rawBooking: Booking) => {
    const booking = normalizeBooking(rawBooking);
    setEditingBooking(booking);
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setCustomerId(booking.customer?.id ? String(booking.customer.id) : "");

    const ids = (booking.rooms ?? []).map((room) => String(room.id));
    setSelectedRoomIds(ids.length > 0 ? ids : [""]);
    setGuestRooms(Math.max(1, ids.length));
    setStatus(booking.status || "CONFIRMED");
    setAdults(booking.adults ?? 1);
    setChildren(booking.children ?? 0);
    setShowGuestDropdown(false);
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --------------------------------------------------
  // UPDATE BOOKING
  // --------------------------------------------------

  const updateBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingBooking) return;
    setError("");

    if (!validateForm()) return;

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `http://localhost:8080/api/bookings/${editingBooking.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createPayload()),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        console.error("Update booking response:", message);
        throw new Error(message || "Update failed.");
      }

      resetForm();
      await loadData();
    } catch (updateError) {
      console.error("Update booking error:", updateError);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update booking. Check room availability."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE BOOKING
  // --------------------------------------------------

  const deleteBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    try {
      setError("");
      const response = await fetch(
        `http://localhost:8080/api/bookings/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Delete failed.");
      }

      await loadData();
    } catch (deleteError) {
      console.error("Delete booking error:", deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete booking."
      );
    }
  };

  // --------------------------------------------------
  // GUEST COUNTERS AND ROOM LABEL
  // --------------------------------------------------

  const increaseAdults = () => setAdults((value) => Math.min(value + 1, 20));
  const decreaseAdults = () => setAdults((value) => Math.max(value - 1, 1));
  const increaseChildren = () => setChildren((value) => Math.min(value + 1, 10));
  const decreaseChildren = () => setChildren((value) => Math.max(value - 1, 0));

  const roomLabel = (room: Room) =>
    `Room ${room.roomNumber} — ${room.roomType} — ₹${Number(
      room.price || 0
    ).toLocaleString("en-IN")}`;

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className={`page ${isAdmin ? "admin-bookings-page" : "guest-bookings-page"}`}>
      <div className="page-header">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "12px",
            }}
          >
            {onBackToDashboard && (
              <button
                type="button"
                className="back-dashboard-button"
                onClick={onBackToDashboard}
              >
                ← Dashboard
              </button>
            )}
          </div>

          <h1>{isAdmin ? "Booking Management" : "My Bookings"}</h1>
          <p>
            {isAdmin
              ? "View, create and manage hotel reservations."
              : "Your reservations, stay details, and upcoming plans in one place."}
          </p>
        </div>

        <button
          type="button"
          className="primary-button guest-booking-header-action"
          onClick={() => (showForm ? resetForm() : openAddForm())}
        >
          {showForm ? "Close" : isAdmin ? "+ Add Booking" : "+ Book a Stay"}
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className={`booking-form ${isAdmin ? "" : "guest-booking-form"}`}>
          <h2>
            {editingBooking
              ? "Edit Booking"
              : isAdmin
                ? "Add New Booking"
                : "Plan your stay"}
          </h2>

          {!isAdmin && (
            <p className="guest-form-intro">
              Choose your dates and guests. Your reservation will be linked to your account.
            </p>
          )}

          <form onSubmit={editingBooking ? updateBooking : addBooking}>
            <div className="booking-date-grid">
              <div className="reference-date-card">
                <label htmlFor="booking-checkin">Check-in</label>
                <input
                  id="booking-checkin"
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCheckIn(value);
                    if (checkOut && value >= checkOut) setCheckOut("");
                  }}
                  required
                />
              </div>

              <div className="reference-date-card">
                <label htmlFor="booking-checkout">Check-out</label>
                <input
                  id="booking-checkout"
                  type="date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(event) => setCheckOut(event.target.value)}
                  required
                />
              </div>
            </div>

            {/* GUEST / ROOM COUNTER */}
            <div className="guest-selector-wrapper">
              <button
                type="button"
                className="guest-selector"
                onClick={() => setShowGuestDropdown((value) => !value)}
              >
                <div className="guest-summary">
                  <span className="guest-icon">GUESTS</span>
                  <div>
                    <strong>
                      {adults} adults{children > 0 ? `, ${children} children` : ""}
                    </strong>
                    <span>
                      {guestRooms} room{guestRooms !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <span className={showGuestDropdown ? "guest-arrow open" : "guest-arrow"}>
                  ⌄
                </span>
              </button>

              {showGuestDropdown && (
                <div className="guest-dropdown">
                  <div className="guest-control-row">
                    <div className="guest-control-label">
                      <strong>Rooms</strong>
                      <span>Number of rooms</span>
                    </div>
                    <div className="guest-counter">
                      <button
                        type="button"
                        onClick={() => resizeRoomSelection(guestRooms - 1)}
                        disabled={guestRooms <= 1}
                        aria-label="Decrease rooms"
                      >
                        −
                      </button>
                      <span>{guestRooms}</span>
                      <button
                        type="button"
                        onClick={() => resizeRoomSelection(guestRooms + 1)}
                        disabled={guestRooms >= 10}
                        aria-label="Increase rooms"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="guest-control-row">
                    <div className="guest-control-label">
                      <strong>Adults</strong>
                      <span>Ages 18 or above</span>
                    </div>
                    <div className="guest-counter">
                      <button type="button" onClick={decreaseAdults} disabled={adults <= 1}>−</button>
                      <span>{adults}</span>
                      <button type="button" onClick={increaseAdults} disabled={adults >= 20}>+</button>
                    </div>
                  </div>

                  <div className="guest-control-row">
                    <div className="guest-control-label">
                      <strong>Children</strong>
                      <span>Ages 0–17</span>
                    </div>
                    <div className="guest-counter">
                      <button type="button" onClick={decreaseChildren} disabled={children <= 0}>−</button>
                      <span>{children}</span>
                      <button type="button" onClick={increaseChildren} disabled={children >= 10}>+</button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="guest-done-button"
                    onClick={() => setShowGuestDropdown(false)}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* CUSTOMER, ROOMS AND STATUS */}
            <div className="booking-select-grid">
              {isAdmin && (
                <div className="form-group">
                  <label htmlFor="booking-customer">Customer</label>
                  <select
                    id="booking-customer"
                    value={customerId}
                    onChange={(event) => setCustomerId(event.target.value)}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} — {customer.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedRoomIds.map((selectedId, index) => {
                const usedByOtherSelections = new Set(
                  selectedRoomIds.filter(
                    (id, roomIndex) => roomIndex !== index && id !== ""
                  )
                );

                // Availability for the selected dates is checked by the backend.
                const selectableRooms = rooms.filter(
                  (room) =>
                    !usedByOtherSelections.has(String(room.id)) ||
                    String(room.id) === selectedId
                );

                return (
                  <div className="form-group" key={`room-selection-${index}`}>
                    <label htmlFor={`booking-room-${index}`}>Room {index + 1}</label>
                    <select
                      id={`booking-room-${index}`}
                      value={selectedId}
                      onChange={(event) => setRoomAtIndex(index, event.target.value)}
                      required
                    >
                      <option value="">Select Room</option>
                      {selectableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {roomLabel(room)} ({room.status})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              {isAdmin && (
                <div className="form-group">
                  <label htmlFor="booking-status">Status</label>
                  <select
                    id="booking-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              )}
            </div>

            <p className="guest-form-intro">
              Selected room total per night: ₹
              {selectedRooms
                .reduce((total, room) => total + Number(room.price || 0), 0)
                .toLocaleString("en-IN")}
            </p>

            {!isAdmin && !customerId && (
              <p className="guest-profile-warning">
                We couldn't find a guest profile for this account. Please contact the hotel before making a reservation.
              </p>
            )}

            <div className="form-buttons">
              <button
                type="submit"
                className="save-button"
                disabled={saving || (!isAdmin && !customerId)}
              >
                {saving
                  ? "Saving..."
                  : editingBooking
                    ? "Update Booking"
                    : isAdmin
                      ? "Add Booking"
                      : "Confirm Reservation"}
              </button>

              {editingBooking && (
                <button type="button" className="cancel-button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="dashboard-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading bookings...</div>}

      {/* EMPTY STATE */}
      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state guest-bookings-empty">
          <div className="empty-icon">BK</div>
          <h2>{isAdmin ? "No bookings yet" : "Your next getaway starts here"}</h2>
          <p>
            {isAdmin
              ? "Create your first hotel reservation."
              : "You don't have any reservations yet. Browse available rooms and book a stay when you're ready."}
          </p>
          <button type="button" className="primary-button" onClick={openAddForm}>
            {isAdmin ? "+ Create Booking" : "+ Book a Stay"}
          </button>
        </div>
      )}

      {/* BOOKING CARDS */}
      {!loading && !error && bookings.length > 0 && (
        <div className="bookings-grid">
          {bookings.map((rawBooking) => {
            const booking = normalizeBooking(rawBooking);
            const bookingRooms = booking.rooms ?? [];
            const roomNumbers = bookingRooms
              .map((room) => String(room.roomNumber))
              .join(", ");
            const roomTypes = bookingRooms
              .map((room) => room.roomType)
              .join(", ");

            return (
              <article
                className={`booking-card ${isAdmin ? "admin-booking-card" : "guest-booking-card"}`}
                key={booking.id}
              >
                {!isAdmin && (
                  <div className="guest-booking-card-top">
                    <span>RESERVATION #{booking.id}</span>
                    <span className={`booking-status ${(booking.status || "confirmed").toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                )}

                <div className="booking-card-header">
                  <div>
                    <h2>
                      {isAdmin
                        ? `Booking #${booking.id}`
                        : roomTypes
                          ? `${roomTypes} Room${bookingRooms.length > 1 ? "s" : ""}`
                          : `Booking #${booking.id}`}
                    </h2>
                    <p>
                      {isAdmin
                        ? booking.customer?.name || "Customer"
                        : `Room${bookingRooms.length === 1 ? "" : "s"} ${roomNumbers || "not assigned"}`}
                    </p>
                  </div>

                  {isAdmin && (
                    <span className={`booking-status ${(booking.status || "confirmed").toLowerCase()}`}>
                      {booking.status}
                    </span>
                  )}
                </div>

                <div className="booking-info">
                  <p>
                    <strong>Room{bookingRooms.length === 1 ? "" : "s"}:</strong>{" "}
                    {roomNumbers || "Not assigned"}
                  </p>
                  <p>
                    <strong>Room Type{bookingRooms.length === 1 ? "" : "s"}:</strong>{" "}
                    {roomTypes || "Not assigned"}
                  </p>
                  <p><strong>Check-in:</strong> {booking.checkIn}</p>
                  <p><strong>Check-out:</strong> {booking.checkOut}</p>
                  <p><strong>Adults:</strong> {booking.adults}</p>
                  <p><strong>Children:</strong> {booking.children}</p>

                  {isAdmin && (
                    <p>
                      <strong>Email:</strong> {booking.customer?.email || "—"}
                    </p>
                  )}

                  <p>
                    <strong>{isAdmin ? "Room total:" : "Price per night:"}</strong>{" "}
                    ₹{getTotalPrice(booking).toLocaleString("en-IN")}
                  </p>

                  {bookingRooms.map((room) => (
                    <p key={room.id}>
                      <strong>Room {room.roomNumber}:</strong>{" "}
                      {room.roomType} — ₹
                      {Number(room.price || 0).toLocaleString("en-IN")} per night
                    </p>
                  ))}
                </div>

                {isAdmin && (
                  <div className="booking-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => startEdit(booking)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => void deleteBooking(booking.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Bookings;
