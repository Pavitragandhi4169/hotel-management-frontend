import { useState } from "react";
import "./LandingPage.css";

type LandingPageProps = {
  onLogin: () => void;
  onRegister: () => void;
};


const roomTypes = [
  {
    name: "Single",
    description: "A welcoming, thoughtfully arranged room for a comfortable solo stay.",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Double",
    description: "A spacious room designed for a restful stay with extra room to unwind.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Suite",
    description: "Enjoy a little more space and comfort in a suite-style room.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85",
  },
];

const services = [
  {
    icon: "🛏️",
    title: "Room Management",
    text: "Keep room types, prices and current room status organized.",
  },
  {
    icon: "📅",
    title: "Reservations",
    text: "Manage hotel reservations through a single workspace.",
  },
  {
    icon: "👥",
    title: "Guest Management",
    text: "Keep guest information accessible to authorized users.",
  },
  {
    icon: "🔐",
    title: "Secure Access",
    text: "Sign in to access the management features assigned to your account.",
  },
];

// Only display facilities confirmed by the hotel.
const amenities = [
  { icon: "⌁", title: "Free Wi-Fi", text: "Stay connected throughout your visit with complimentary Wi-Fi." },
  { icon: "♨", title: "Dining / Restaurant", text: "Enjoy dining options during your stay." },
  { icon: "≈", title: "Swimming Pool", text: "Unwind with a refreshing swim during your stay." },
  { icon: "✧", title: "Gym / Fitness Centre", text: "Make time for movement and your fitness routine." },
  { icon: "♧", title: "Room Service", text: "Enjoy the convenience of service delivered to your room." },
  { icon: "❄", title: "Air-conditioned Rooms", text: "Relax in a comfortably air-conditioned room." },
];

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}



export default function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [searchMessage, setSearchMessage] = useState("");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFindRoom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchMessage("");

    // Finding rooms requires an account, so send the visitor to the login page.
    onLogin();
  };



  return (
    <div className="hotel-home">
      <header className="home-navbar">
        <button type="button" className="home-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Hotel homepage">
          <span className="home-brand-icon">✦</span>
          <span><strong>HOTEL</strong><small>LUXURY STAYS &amp; SUITES</small></span>
        </button>

        <nav className="home-nav" aria-label="Main navigation">
          <button type="button" onClick={() => scrollTo("featured-rooms")}>Rooms</button>
          <button type="button" onClick={() => scrollTo("home-amenities")}>Amenities</button>
          <button type="button" onClick={() => scrollTo("home-services")}>Services</button>
          <button type="button" onClick={() => scrollTo("home-about")}>About</button>
          <button type="button" onClick={() => scrollTo("home-footer")}>Contact</button>
        </nav>

        <div className="home-nav-actions">
          <button type="button" className="home-login-button" onClick={onLogin}>Log in</button>
          <button type="button" className="home-signup-button" onClick={onRegister}>Get Started <span aria-hidden="true">↗</span></button>
        </div>
      </header>

      <main>
        <section className="home-hero">
          <img className="home-hero-image" src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2200&q=90" alt="Hotel resort with a swimming pool" />
          <div className="home-hero-shade" />
          <div className="home-hero-content">
            <span className="home-eyebrow">LUXURY HOTEL & SUITES</span>
            <h1>An extraordinary<br /><span>stay awaits.</span></h1>
            <p>Explore thoughtfully presented room types and plan your visit with a simpler booking experience.</p>
            <div className="home-hero-actions">
              <button type="button" className="home-primary-cta" onClick={() => scrollTo("featured-rooms")}>Explore Our Rooms <span aria-hidden="true">→</span></button>
              <button type="button" className="home-secondary-cta" onClick={onLogin}>Guest & Staff Login</button>
            </div>
            <div className="home-trust-note"><span className="home-trust-dot" />Thoughtfully designed for better stays</div>
          </div>
          <div className="home-hero-caption"><span>DESIGNED FOR BETTER STAYS</span><span>01 / YOUR STAY</span></div>
        </section>

        <section className="home-search-section" aria-label="Plan your stay">
          <form className="home-search-panel" onSubmit={handleFindRoom}>
            <div className="home-search-field"><label htmlFor="home-checkin">CHECK-IN</label><input id="home-checkin" type="date" min={localDateString(new Date())} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} required /></div>
            <div className="home-search-divider" />
            <div className="home-search-field"><label htmlFor="home-checkout">CHECK-OUT</label><input id="home-checkout" type="date" min={checkIn || localDateString(new Date())} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} required /></div>
            <div className="home-search-divider" />
            <div className="home-search-field"><label htmlFor="home-guests">GUESTS</label><select id="home-guests" value={guests} onChange={(event) => setGuests(event.target.value)}><option value="1">1 Guest</option><option value="2">2 Guests</option><option value="3">3 Guests</option><option value="4">4 Guests</option><option value="5">5+ Guests</option></select></div>
            <button className="home-search-button" type="submit">Find Rooms <span aria-hidden="true">→</span></button>
          </form>
          <p className="home-search-note">Browse room types here. Exact room availability and rates are confirmed after sign-in.</p>
          {searchMessage && <p className="home-search-feedback" role="status">{searchMessage}</p>}
        </section>

        <section className="home-rooms-section" id="featured-rooms">
          <div className="home-section-heading">
            <div><span className="home-section-kicker">STAY YOUR WAY</span><h2>Find your perfect room.</h2><p>Explore the room types offered by our hotel.</p></div>
            <button type="button" className="home-text-link" onClick={onLogin}>Manage reservations ↗</button>
          </div>

          <div className="home-room-grid">
            {roomTypes.map((room) => (
              <article className="home-room-card" key={room.name.toLowerCase()}>
                <div className="home-room-image-wrap">
                  <img src={room.image} alt={`${room.name} room type`} loading="lazy" />
                </div>
                <div className="home-room-content">
                  <div className="home-room-title-row">
                    <h3>{room.name}</h3>
                    <span className="home-room-arrow" aria-hidden="true">↗</span>
                  </div>
                  <p>{room.description}</p>
                  <div className="home-room-footer">
                    <span className="home-room-type-note">Room type</span>
                    <button type="button" onClick={onLogin}>Explore room <span aria-hidden="true">→</span></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-about-section" id="home-about">
          <div className="home-about-image"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85" alt="Warm, thoughtfully designed interior" loading="lazy" /><div className="home-image-label"><span>THE HOTEL HMS EXPERIENCE</span><strong>Thoughtful by design.</strong></div></div>
          <div className="home-about-content"><span className="home-section-kicker">HOSPITALITY, SIMPLIFIED</span><h2>A more thoughtful way<br />to experience hospitality.</h2><p>Comfort meets thoughtful service. Explore room details and discover a smoother way to plan your stay, while our team keeps every reservation organized behind the scenes.</p><div className="home-about-points"><div><span>01</span><p><strong>One organized workspace</strong><small>Keep rooms, guests and reservations together.</small></p></div><div><span>02</span><p><strong>Simpler workflows</strong><small>Move between essential tasks with ease.</small></p></div><div><span>03</span><p><strong>Role-based access</strong><small>Access management features after signing in.</small></p></div></div><button type="button" className="home-dark-button" onClick={onRegister}>Get Started <span aria-hidden="true">→</span></button></div>
        </section>

        <section className="home-amenities-section" id="home-amenities">
          <div className="home-section-heading"><div><span className="home-section-kicker">THOUGHTFUL COMFORTS</span><h2>Elevate Your Stay</h2><p>Considered comforts and little conveniences to make every stay feel special.</p></div></div>
          <div className="home-amenities-grid">{amenities.map((item, index) => <article className="home-amenity-card" key={item.title}><span className="home-amenity-number">0{index + 1}</span><div className="home-amenity-icon" aria-hidden="true">{item.icon}</div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        </section>

        <section className="home-services-section" id="home-services">
          <div className="home-section-heading home-services-heading"><div><span className="home-section-kicker">ONE CONNECTED WORKSPACE</span><h2>Everything you need to stay organized.</h2><p>A considered experience for guests and a connected workspace for our team.</p></div></div>
          <div className="home-services-grid">{services.map((service, index) => <article className="home-service-card" key={service.title}><span className="home-service-number">0{index + 1}</span><div className="home-service-icon">{service.icon}</div><h3>{service.title}</h3><p>{service.text}</p></article>)}</div>
        </section>

        <section className="home-final-cta"><div><span className="home-section-kicker">YOUR HOTEL, ORGANIZED</span><h2>Make room for a better experience.</h2><p>Your next memorable stay starts here.</p></div><button type="button" onClick={onLogin}>Plan Your Stay <span aria-hidden="true">→</span></button></section>
      </main>

      <footer className="home-footer" id="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-brand-block">
            <button
              type="button"
              className="home-footer-brand"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Hotel HMS — back to top"
            >
              <span className="home-brand-icon" aria-hidden="true">✦</span>
              <span className="home-footer-brand-copy">
                <strong>HOTEL</strong>
                <small>LUXURY STAYS &amp; SUITES</small>
              </span>
            </button>
            <p className="home-footer-tagline">
              Thoughtful comfort. Seamless stays.
            </p>
            <span className="home-footer-brand-rule" aria-hidden="true" />
          </div>

          <div className="home-footer-column">
            <h3>EXPLORE</h3>
            <button type="button" onClick={() => scrollTo("featured-rooms")}>Room Types</button>
            <button type="button" onClick={() => scrollTo("home-amenities")}>Amenities</button>
            <button type="button" onClick={() => scrollTo("home-services")}>Services</button>
            <button type="button" onClick={() => scrollTo("home-about")}>About Us</button>
          </div>

          <div className="home-footer-column">
            <h3>YOUR ACCOUNT</h3>
            <button type="button" onClick={onLogin}>Sign In</button>
            <button type="button" onClick={onRegister}>Create Account</button>
            <button type="button" onClick={onLogin}>Plan Your Stay</button>
          </div>

          <div className="home-footer-note">
            <span className="home-footer-note-mark" aria-hidden="true">✦</span>
            <p>Make space for the moments that matter.</p>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              BACK TO TOP <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>

        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} Hotel HMS. All rights reserved.</span>
          <span className="home-footer-bottom-center">HOSPITALITY, THOUGHTFULLY ORGANIZED</span>
          <span className="home-footer-bottom-right"><span aria-hidden="true">✦</span> LUXURY STAYS &amp; SUITES</span>
        </div>
      </footer>
    </div>
  );
}
