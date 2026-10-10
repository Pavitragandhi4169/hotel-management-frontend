import { useEffect, useState } from "react";

import Rooms from "./Rooms";
import Customers from "./Customers";
import Bookings from "./Bookings";
import Staff from "./Staff";

import "./GuestPortal.css";
import "./UserDashboard.css";
import "./AdminTheme.css";

interface JwtPayload {
  role?: string;
  roles?: string[];
  sub?: string;
}

type Page =
  | "dashboard"
  | "rooms"
  | "customers"
  | "bookings"
  | "staff";

function Dashboard() {
  const [activePage, setActivePage] =
    useState<Page>("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [selectedRoomId, setSelectedRoomId] =
    useState<number | null>(null);

  const [userRole, setUserRole] =
    useState("USER");

  const [rooms, setRooms] = useState(0);
  const [bookings, setBookings] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [staff, setStaff] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // GET USER ROLE FROM JWT
  // ==========================================

  const getUserRole = (): string => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      return "USER";
    }

    try {
      const payload =
        token.split(".")[1];

      const decoded: JwtPayload =
        JSON.parse(
          atob(
            payload
              .replace(/-/g, "+")
              .replace(/_/g, "/")
          )
        );

      if (decoded.role) {
        return decoded.role.toUpperCase();
      }

      if (
        decoded.roles &&
        decoded.roles.length > 0
      ) {
        return decoded.roles[0].toUpperCase();
      }

      return "USER";
    } catch (error) {
      console.error(
        "JWT decode error:",
        error
      );

      return "USER";
    }
  };

  // ==========================================
  // LOAD ADMIN DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    const loadDashboard =
      async () => {
        const token =
          localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const role =
          getUserRole();

        setUserRole(role);

        /*
         * USER does not need
         * admin statistics.
         */
        if (role !== "ADMIN") {
          setLoading(false);
          return;
        }

        try {
          const headers = {
            Authorization:
              `Bearer ${token}`,
          };

          const [
            roomsResponse,
            bookingsResponse,
            customersResponse,
            staffResponse,
          ] = await Promise.all([
            fetch(
              "http://localhost:8080/api/rooms",
              { headers }
            ),

            fetch(
              "http://localhost:8080/api/bookings",
              { headers }
            ),

            fetch(
              "http://localhost:8080/api/customers",
              { headers }
            ),

            fetch(
              "http://localhost:8080/api/staff",
              { headers }
            ),
          ]);

          if (
            !roomsResponse.ok ||
            !bookingsResponse.ok ||
            !customersResponse.ok
          ) {
            throw new Error(
              "Failed to load dashboard data"
            );
          }

          const roomsData =
            await roomsResponse.json();

          const bookingsData =
            await bookingsResponse.json();

          const customersData =
            await customersResponse.json();

          setRooms(
            Array.isArray(roomsData)
              ? roomsData.length
              : 0
          );

          setBookings(
            Array.isArray(bookingsData)
              ? bookingsData.length
              : 0
          );

          setCustomers(
            Array.isArray(customersData)
              ? customersData.length
              : 0
          );

          if (staffResponse.ok) {
            const staffData =
              await staffResponse.json();

            setStaff(
              Array.isArray(staffData)
                ? staffData.length
                : 0
            );
          }
        } catch (error) {
          console.error(
            "Dashboard error:",
            error
          );

          setError(
            "Unable to load dashboard data."
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const openPage = (
    page: Page
  ) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");

    window.location.reload();
  };

  // ==========================================
  // DASHBOARD PAGE
  // ==========================================

  const renderDashboard =
    () => {
      if (userRole === "USER") {
        return (
          <section className="user-dashboard">

            {/* HERO */}
            <div className="user-welcome-card">

              <div className="user-welcome-icon">
                ✦
              </div>

              <span className="user-welcome-eyebrow">YOUR STAY, BEAUTIFULLY ORGANIZED</span>

              <h2>
                Your stay,
                <br />
                made simple.
              </h2>

              <p>
                Discover available rooms,
                manage your reservations,
                and enjoy a seamless
                hotel experience.
              </p>

              <div className="user-hero-actions">

                <button
                  className="user-primary-button"
                  type="button"
                  onClick={() =>
                    openPage("rooms")
                  }
                >
                  Explore Rooms

                  <span>
                    →
                  </span>
                </button>

                <button
                  className="user-secondary-button"
                  type="button"
                  onClick={() =>
                    openPage("bookings")
                  }
                >
                  My Bookings
                </button>

              </div>

            </div>

            {/* QUICK ACCESS */}
            <section className="user-quick-section">

              <div className="user-section-heading">

                <span>
                  QUICK ACCESS
                </span>

                <h2>
                  Everything you need
                </h2>

                <p>
                  Manage your hotel
                  experience from one
                  simple place.
                </p>

              </div>

              <div className="user-info-grid">

                {/* BOOK ROOM */}
                <button
                  type="button"
                  className="user-info-card"
                  onClick={() =>
                    openPage("rooms")
                  }
                >

                  <div className="user-info-top">

                    <div className="user-info-icon">
                      RM
                    </div>

                    <span className="user-arrow">
                      →
                    </span>

                  </div>

                  <h3>
                    Book a Room
                  </h3>

                  <p>
                    Find an available room
                    and choose the right
                    accommodation for your stay.
                  </p>

                  <span className="user-card-link">
                    Explore rooms
                  </span>

                </button>

                {/* MY BOOKINGS */}
                <button
                  type="button"
                  className="user-info-card"
                  onClick={() =>
                    openPage("bookings")
                  }
                >

                  <div className="user-info-top">

                    <div className="user-info-icon booking-icon">
                      BK
                    </div>

                    <span className="user-arrow">
                      →
                    </span>

                  </div>

                  <h3>
                    My Bookings
                  </h3>

                  <p>
                    Keep track of your hotel
                    reservations and upcoming
                    stays.
                  </p>

                  <span className="user-card-link">
                    View bookings
                  </span>

                </button>

              </div>

              {/* BOTTOM INFORMATION */}
              <div className="user-bottom-info">

                <div className="user-bottom-item">

                  <div className="user-bottom-icon">
                    SEC
                  </div>

                  <div>
                    <strong>
                      Secure Access
                    </strong>

                    <span>
                      Your account is protected
                      with secure authentication.
                    </span>
                  </div>

                </div>

                <div className="user-bottom-divider" />

                <div className="user-bottom-item">

                  <div className="user-bottom-icon">
                    HMS
                  </div>

                  <div>
                    <strong>
                      Simple Experience
                    </strong>

                    <span>
                      Everything you need is
                      organized in one place.
                    </span>
                  </div>

                </div>

              </div>

            </section>

          </section>
        );
      }

      // ======================================
      // ADMIN DASHBOARD
      // ======================================

      return (
        <>
          {loading && (
            <div className="loading">
              Loading dashboard...
            </div>
          )}

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {!loading &&
            !error && (
              <>
                <header className="top-header">

                  <div>
                    <h1>
                      Dashboard
                    </h1>

                    <p>
                      Welcome back, Admin
                    </p>
                  </div>

                  <div className="admin-badge">
                    ADMIN
                  </div>

                </header>

                {/* STATISTICS */}
                <section className="stats-grid">

                  <div className="stat-card">

                    <div className="stat-icon">
                      RM
                    </div>

                    <div>
                      <p>
                        Total Rooms
                      </p>

                      <h2>
                        {rooms}
                      </h2>
                    </div>

                  </div>

                  <div className="stat-card">

                    <div className="stat-icon">
                      BK
                    </div>

                    <div>
                      <p>
                        Total Bookings
                      </p>

                      <h2>
                        {bookings}
                      </h2>
                    </div>

                  </div>

                  <div className="stat-card">

                    <div className="stat-icon">
                      CU
                    </div>

                    <div>
                      <p>
                        Customers
                      </p>

                      <h2>
                        {customers}
                      </h2>
                    </div>

                  </div>

                  <div className="stat-card">

                    <div className="stat-icon">
                      ST
                    </div>

                    <div>
                      <p>
                        Staff Members
                      </p>

                      <h2>
                        {staff}
                      </h2>
                    </div>

                  </div>

                </section>

                {/* QUICK ACTIONS */}
                <section className="section">

                  <h2>
                    Quick Actions
                  </h2>

                  <div className="action-grid">

                    <button
                      type="button"
                      className="action-card"
                      onClick={() =>
                        openPage("rooms")
                      }
                    >
                      <span>
                        RM
                      </span>

                      <h3>
                        Manage Rooms
                      </h3>

                      <p>
                        Add and manage hotel rooms
                      </p>
                    </button>

                    <button
                      type="button"
                      className="action-card"
                      onClick={() =>
                        openPage("customers")
                      }
                    >
                      <span>
                        CU
                      </span>

                      <h3>
                        Manage Customers
                      </h3>

                      <p>
                        Add and manage customers
                      </p>
                    </button>

                    <button
                      type="button"
                      className="action-card"
                      onClick={() =>
                        openPage("bookings")
                      }
                    >
                      <span>
                        BK
                      </span>

                      <h3>
                        Manage Bookings
                      </h3>

                      <p>
                        Create and manage bookings
                      </p>
                    </button>

                    <button
                      type="button"
                      className="action-card"
                      onClick={() =>
                        openPage("staff")
                      }
                    >
                      <span>
                        ST
                      </span>

                      <h3>
                        Manage Staff
                      </h3>

                      <p>
                        Manage hotel staff
                      </p>
                    </button>

                  </div>

                </section>
              </>
            )}
        </>
      );
    };

  // ==========================================
  // PAGE CONTENT
  // ==========================================

  const renderPage =
    () => {
      switch (activePage) {

        case "rooms":
          return (
            <Rooms
              onBackToDashboard={() =>
                openPage("dashboard")
              }
              onBookRoom={(roomId) => {
                setSelectedRoomId(roomId);
                openPage("bookings");
              }}
            />
          );

        case "bookings":
          return (
            <Bookings
              onBackToDashboard={() =>
                openPage("dashboard")
              }
              initialRoomId={selectedRoomId ?? undefined}
              onInitialRoomHandled={() =>
                setSelectedRoomId(null)
              }
            />
          );

        case "customers":
          if (userRole === "ADMIN") {
            return (
              <Customers
                onBackToDashboard={() =>
                  openPage("dashboard")
                }
              />
            );
          }
          return renderDashboard();

        case "staff":
          if (userRole === "ADMIN") {
            return (
              <Staff
                onBackToDashboard={() =>
                  openPage("dashboard")
                }
              />
            );
          }
          return renderDashboard();

        default:
          return renderDashboard();
      }
    };

  return (
    <div className="dashboard">

      {/* ====================================
          MENU BUTTON
      ==================================== */}

      {!sidebarOpen && (
        <button
          type="button"
          className="menu-button"
          onClick={() =>
            setSidebarOpen(true)
          }
          aria-label="Open menu"
        >
          <span className="menu-icon">
            ≡
          </span>

          <span>
            Menu
          </span>
        </button>
      )}

      {/* ====================================
          OVERLAY
      ==================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ====================================
          SIDEBAR
      ==================================== */}

      <aside
        className={
          sidebarOpen
            ? "sidebar sidebar-open"
            : "sidebar"
        }
      >

        <div className="sidebar-header">

          <div className="sidebar-logo">
            ✦

            <span>
              Hotel HMS
            </span>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
          >
            ×
          </button>

        </div>

        <nav className="sidebar-nav">

          <button
            type="button"
            className={
              activePage === "dashboard"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() =>
              openPage("dashboard")
            }
          >
            <span className="sidebar-link-icon">
              DB
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className={
              activePage === "rooms"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() =>
              openPage("rooms")
            }
          >
            <span className="sidebar-link-icon">
              RM
            </span>

            <span>
              Rooms
            </span>
          </button>

          {userRole === "ADMIN" && (
            <button
              type="button"
              className={
                activePage === "customers"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() =>
                openPage("customers")
              }
            >
              <span className="sidebar-link-icon">
                CU
              </span>

              <span>
                Customers
              </span>
            </button>
          )}

          <button
            type="button"
            className={
              activePage === "bookings"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() =>
              openPage("bookings")
            }
          >
            <span className="sidebar-link-icon">
              BK
            </span>

            <span>
              Bookings
            </span>
          </button>

          {userRole === "ADMIN" && (
            <button
              type="button"
              className={
                activePage === "staff"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() =>
                openPage("staff")
              }
            >
              <span className="sidebar-link-icon">
                ST
              </span>

              <span>
                Staff
              </span>
            </button>
          )}

        </nav>

        {/* LOGOUT */}
        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            <span>
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* ====================================
          MAIN CONTENT
      ==================================== */}

      <main className={userRole === "ADMIN" ? "main-content admin-main-content" : "main-content guest-main-content"}>
        {renderPage()}
      </main>

    </div>
  );
}

export default Dashboard;