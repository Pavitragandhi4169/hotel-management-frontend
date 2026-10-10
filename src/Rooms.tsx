import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./GuestPortal.css";

interface Room {
  id: number;
  roomNumber: number;
  roomType: string;
  price: number;
  status: string;
}

interface RoomsProps {
  onBackToDashboard?: () => void;
  onBookRoom?: (roomId: number) => void;
}

interface RoomTokenPayload {
  role?: string;
  roles?: string[];
}

function getRoomImage(roomType: string): string {
  const images: Record<string, string> = {
    SINGLE: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1100&q=85",
    DOUBLE: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1100&q=85",
    DELUXE: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1100&q=85",
    SUITE: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85",
  };
  return images[roomType.toUpperCase()] || images.DOUBLE;
}

function getCurrentRole(): string {
  const token = localStorage.getItem("token");
  if (!token) return "USER";
  try {
    const payload = token.split(".")[1];
    const decoded: RoomTokenPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    const role = (decoded.role || decoded.roles?.[0] || "USER").toUpperCase();
    return role.startsWith("ROLE_") ? role.slice(5) : role;
  } catch {
    return "USER";
  }
}

function Rooms({
  onBackToDashboard,
  onBookRoom,
}: RoomsProps) {
  const isAdmin = getCurrentRole() === "ADMIN";
  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingRoom, setEditingRoom] =
    useState<Room | null>(null);

  const [roomNumber, setRoomNumber] =
    useState("");

  const [roomType, setRoomType] =
    useState("SINGLE");

  const [price, setPrice] =
    useState("");

  const [status, setStatus] =
    useState("AVAILABLE");

  const token =
    localStorage.getItem("token");

  // ==========================================
  // LOAD ROOMS
  // ==========================================

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError(
          "You are not logged in."
        );
        return;
      }

      const response =
        await fetch(
          "http://localhost:8080/api/rooms",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load rooms"
        );
      }

      const data =
        await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid rooms response"
        );
      }

      setRooms(data);
    } catch (error) {
      console.error(
        "Load rooms error:",
        error
      );

      setError(
        "Unable to load rooms."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setRoomNumber("");
    setRoomType("SINGLE");
    setPrice("");
    setStatus("AVAILABLE");

    setEditingRoom(null);
    setShowForm(false);
    setError("");
  };

  // ==========================================
  // ADD ROOM
  // ==========================================

  const handleAddRoom = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      if (!roomNumber) {
        setError(
          "Please enter a room number."
        );
        return;
      }

      if (!price) {
        setError(
          "Please enter a room price."
        );
        return;
      }

      const response =
        await fetch(
          "http://localhost:8080/api/rooms",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              roomNumber:
                Number(roomNumber),

              roomType,

              price:
                Number(price),

              status,
            }),
          }
        );

      if (!response.ok) {
        const message =
          await response.text();

        console.error(
          "Add room response:",
          message
        );

        throw new Error(
          "Failed to create room"
        );
      }

      resetForm();

      await fetchRooms();
    } catch (error) {
      console.error(
        "Add room error:",
        error
      );

      setError(
        "Unable to create room."
      );
    }
  };

  // ==========================================
  // START EDIT
  // ==========================================

  const handleEditClick = (
    room: Room
  ) => {
    setEditingRoom(room);

    setRoomNumber(
      String(room.roomNumber)
    );

    setRoomType(
      room.roomType
    );

    setPrice(
      String(room.price)
    );

    setStatus(
      room.status
    );

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // UPDATE ROOM
  // ==========================================

  const handleUpdateRoom = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingRoom) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `http://localhost:8080/api/rooms/${editingRoom.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              id: editingRoom.id,

              roomNumber:
                Number(roomNumber),

              roomType,

              price:
                Number(price),

              status,
            }),
          }
        );

      if (!response.ok) {
        const message =
          await response.text();

        console.error(
          "Update room response:",
          message
        );

        throw new Error(
          "Failed to update room"
        );
      }

      resetForm();

      await fetchRooms();
    } catch (error) {
      console.error(
        "Update room error:",
        error
      );

      setError(
        "Unable to update room."
      );
    }
  };

  // ==========================================
  // DELETE ROOM
  // ==========================================

  const handleDeleteRoom = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      if (!token) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/rooms/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // The backend returns a message for some errors. Read it so the
      // page can explain why the deletion failed instead of hiding the cause.
      const responseText = await response.text();

      if (!response.ok) {
        const details = responseText.trim();
        const normalizedDetails = details.toLowerCase();

        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (response.status === 403) {
          throw new Error("Only an administrator can delete rooms.");
        }

        if (
          response.status === 409 ||
          normalizedDetails.includes("foreign key") ||
          normalizedDetails.includes("constraint") ||
          normalizedDetails.includes("booking") ||
          normalizedDetails.includes("integrity")
        ) {
          throw new Error(
            "This room is linked to an existing booking and cannot be deleted yet. Remove or cancel the linked booking first."
          );
        }

        throw new Error(
          details || `Room deletion failed (HTTP ${response.status}). Check the backend console for details.`
        );
      }

      // Refresh the inventory only after the server confirms deletion.
      await fetchRooms();
      setSuccess("Room deleted successfully.");
    } catch (error) {
      console.error("Delete room error:", error);
      setError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to delete room. Check the backend console for details."
      );
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className={`page ${isAdmin ? "admin-rooms-page" : "guest-rooms-page"}`}>

      {/* =====================================
          HEADER
      ===================================== */}

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
                onClick={
                  onBackToDashboard
                }
              >
                ← Dashboard
              </button>
            )}

          </div>

          <h1>
            {isAdmin ? "Room Management" : "Find your stay"}
          </h1>

          <p>
            {isAdmin
              ? "Manage room inventory, rates and availability."
              : "Explore our rooms, compare nightly rates, and choose the right stay for you."}
          </p>

        </div>

        {isAdmin && (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
                setError("");
              }
            }}
          >
            {showForm ? "Close" : "+ Add Room"}
          </button>
        )}

      </div>

      {/* =====================================
          FORM
      ===================================== */}

      {isAdmin && showForm && (
        <div className="room-form">

          <h2>
            {editingRoom
              ? "Edit Room"
              : "Add New Room"}
          </h2>

          <form
            onSubmit={
              editingRoom
                ? handleUpdateRoom
                : handleAddRoom
            }
          >

            <div className="room-form-grid">

              {/* ROOM NUMBER */}
              <div className="form-group">

                <label>
                  Room Number
                </label>

                <input
                  type="number"
                  placeholder="Example: 103"
                  value={roomNumber}
                  onChange={(event) =>
                    setRoomNumber(
                      event.target.value
                    )
                  }
                  required
                />

              </div>

              {/* ROOM TYPE */}
              <div className="form-group">

                <label>
                  Room Type
                </label>

                <select
                  value={roomType}
                  onChange={(event) =>
                    setRoomType(
                      event.target.value
                    )
                  }
                >
                  <option value="SINGLE">
                    SINGLE
                  </option>

                  <option value="DOUBLE">
                    DOUBLE
                  </option>

                  <option value="DELUXE">
                    DELUXE
                  </option>

                  <option value="SUITE">
                    SUITE
                  </option>
                </select>

              </div>

              {/* PRICE */}
              <div className="form-group">

                <label>
                  Price per Night
                </label>

                <input
                  type="number"
                  placeholder="Example: 2500"
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value
                    )
                  }
                  required
                />

              </div>

              {/* STATUS */}
              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                >
                  <option value="AVAILABLE">
                    AVAILABLE
                  </option>

                  <option value="BOOKED">
                    BOOKED
                  </option>
                </select>

              </div>

            </div>

            <div className="form-buttons">

              <button
                type="submit"
                className="save-button"
              >
                {editingRoom
                  ? "Update Room"
                  : "Add Room"}
              </button>

              {editingRoom && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>
      )}

      {/* =====================================
          SUCCESS
      ===================================== */}

      {success && (
        <div className="dashboard-success" role="status">
          <span>{success}</span>
          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="dashboard-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* =====================================
          LOADING
      ===================================== */}

      {loading && (
        <div className="loading">
          Loading rooms...
        </div>
      )}

      {/* =====================================
          EMPTY STATE
      ===================================== */}

      {!loading &&
        !error &&
        rooms.length === 0 && (
          <div className="empty-state">

            <div className="empty-icon">
              🏨
            </div>

            <h2>
              No rooms found
            </h2>

            <p>
              {isAdmin
                ? "Add your first hotel room to get started."
                : "There are no rooms to display right now. Please check again soon."}
            </p>

            {isAdmin && (
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                + Add First Room
              </button>
            )}

          </div>
        )}

      {/* =====================================
          ROOM CARDS
      ===================================== */}

      {!loading &&
        !error &&
        rooms.length > 0 && (

          <div className="rooms-grid">

            {rooms.map((room) => (

              <article
                className={`room-card ${isAdmin ? "admin-room-card" : "guest-room-card"}`}
                key={room.id}
              >
                {!isAdmin && (
                  <div className="guest-room-visual">
                    <img src={getRoomImage(room.roomType)} alt={`${room.roomType} hotel room`} loading="lazy" />
                    <span className="guest-room-photo-label">HOTEL HMS</span>
                  </div>
                )}

                <div className="room-card-header">

                  <div>
                    {!isAdmin && <span className="guest-room-eyebrow">{room.roomType} ACCOMMODATION</span>}
                    <h2>
                      Room {room.roomNumber}
                    </h2>
                  </div>

                  <span
                    className={
                      room.status
                        .toUpperCase() ===
                      "AVAILABLE"
                        ? "status available"
                        : "status booked"
                    }
                  >
                    {room.status}
                  </span>

                </div>

                <div className="room-info">

                  <p>
                    <strong>
                      Type:
                    </strong>{" "}
                    {room.roomType}
                  </p>

                  <p>
                    <strong>
                      Price:
                    </strong>{" "}
                    ₹{room.price}
                  </p>

                </div>

                {isAdmin ? (
                  <div className="room-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleEditClick(room)}
                    >Edit</button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteRoom(room.id)}
                    >Delete</button>
                  </div>
                ) : (
                  <div className="guest-room-footer">
                    <div className="guest-room-price">
                      <strong>₹{room.price.toLocaleString("en-IN")}</strong>
                      <span>per night</span>
                    </div>
                    <button
                      type="button"
                      className="guest-book-room-button"
                      disabled={room.status.toUpperCase() !== "AVAILABLE"}
                      onClick={() => onBookRoom?.(room.id)}
                    >
                      {room.status.toUpperCase() === "AVAILABLE" ? "Book this room" : "Unavailable"}
                      {room.status.toUpperCase() === "AVAILABLE" && <span aria-hidden="true">→</span>}
                    </button>
                  </div>
                )}

              </article>

            ))}

          </div>
        )}

    </div>
  );
}

export default Rooms;