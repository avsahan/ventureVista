import { useEffect, useState } from 'react';
import { cancelTrip, getBookings, getTrips, respondToCounterOffer } from '../api/auth';
import BookingChat from '../components/BookingChat';
import '../styles/TravelerDashboard.css';

const tabs = [
  { id: 'upcoming', label: 'Upcoming Trips', icon: '▦' },
  { id: 'completed', label: 'Past Completed Trips', icon: '✓' },
  { id: 'chat', label: 'Live Guide Chat & Communication', icon: '▢' },
];

/* ---------- Small components ---------- */

function ProfileCard({ profile, onChange, onSave, saved }) {
  const fields = [
    { key: 'name', label: 'Full name', type: 'text' },
    { key: 'country', label: 'Country', type: 'select' },
    { key: 'email', label: 'Email address', type: 'email' },
    { key: 'phone', label: 'Phone number', type: 'tel' },
    // { key: 'passport', label: 'Passport number', type: 'text' },
  ];

  return (
    <aside className="rl-profile" aria-label="My profile">
      <div className="rl-profile__header">
        <h2>My profile</h2>
      </div>

      <div className="rl-profile__identity">
        <div className="rl-profile__photo-wrap">
          <img
            className="rl-profile__photo"
            src="https://img.icons8.com/fluency-systems-regular/200/user--v1.png?utm_source=chatgpt.com"
            alt={profile.name}
          />
          {/* <button className="rl-profile__camera" type="button" aria-label="Change photo"></button> */}
        </div>
        <h3>{profile.name}</h3>
        <p>Curious traveler · Member since 2025</p>
      </div>

      <form
        className="rl-profile__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        {fields.map((field) => (
          <label className="rl-field" key={field.key}>
            <span className="rl-field__label">{field.label}</span>
            <span className="rl-field__control">
              {field.type === 'select' ? (
                <>
                  <select value={profile.country} onChange={(e) => onChange('country', e.target.value)}>
                    {!['United Kingdom', 'United States', 'Australia', 'Germany', 'India'].includes(profile.country) && (
                      <option value={profile.country}>{profile.country || 'Select country'}</option>
                    )}
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>India</option>
                  </select>
                  {/* <span className="rl-field__icon" aria-hidden="true">⌄</span> */}
                </>
              ) : (
                <>
                  <input
                    type={field.type}
                    value={profile[field.key]}
                    onChange={(e) => onChange(field.key, e.target.value)}
                  />
                  <span className="rl-field__icon" aria-hidden="true">✎</span>
                </>
              )}
            </span>
          </label>
        ))}

        <div className="rl-prefs">
          <div className="rl-prefs__header">
            <strong>Travel preferences</strong>
            <button className="rl-icon-button rl-icon-button--accent" type="button" aria-label="Edit preferences"></button>
          </div>
          <div className="rl-prefs__chips">
            {(Array.isArray(profile.travelInterests) ? profile.travelInterests : []).map((chip) => (
              <span className="rl-chip" key={chip}>{chip}</span>
            ))}
          </div>
          {/* <p className="rl-prefs__text">
            {profile.travelInterests.length
              ? profile.travelInterests.join(' · ')
              : 'No travel preferences added yet.'}
          </p> */}
        </div>

        <button className="rl-button rl-button--primary rl-button--block" type="submit">
          {saved ? 'Changes saved ✓' : 'Save profile changes'}
        </button>
        {/* <p className="rl-profile__secure">
          <span aria-hidden="true">⛨</span> Your personal details stay private and secure.
        </p> */}
      </form>
    </aside>
  );
}

function UpcomingTripCard({ trip, onMessage, onItinerary, onRespondCounterOffer, onCancelTrip, isCancelling }) {
  return (
    <article className="rl-trip-card">
      <div className="rl-trip-card__main">
        <div className="rl-trip-card__media">
          <img src={trip.image} alt="" />
          <span className="rl-trip-card__badge">{trip.duration.replace(' · ', ' · ')}</span>
        </div>

        <div className="rl-trip-card__body">
          <div className="rl-trip-card__top">
            <span className="rl-eyebrow">{trip.region}</span>
            <span className={`rl-status rl-status--${trip.status}`}>
              <span aria-hidden="true">{trip.status === 'confirmed' ? '✓' : '◷'}</span>
              {trip.statusLabel}
            </span>
          </div>

          <h3>{trip.title}</h3>
          <p className="rl-trip-card__meta">
            <span aria-hidden="true">▦</span> {trip.dates} <span aria-hidden="true">·</span> {trip.id}
          </p>

          <ol className="rl-trip-card__stops">
            {trip.stops.map((stop, index) => (
              <li key={stop}>
                <b>{String(index + 1).padStart(2, '0')}</b> {stop}
              </li>
            ))}
          </ol>

          <div className="rl-trip-card__footer">
            <div className="rl-guide-mini">
              <span className="rl-avatar rl-avatar--sm">{trip.guideInitials}</span>
              <span>
                <small>Your local guide</small>
                <strong>{trip.guide}</strong>
              </span>
            </div>
            <div className="rl-trip-card__actions">
              {trip.bookingStatus === 'countered' && (
                <>
                  <button className="rl-button rl-button--outline" type="button" onClick={() => onRespondCounterOffer(trip.bookingId, 'declined')}>Decline offer</button>
                  <button className="rl-button rl-button--primary" type="button" onClick={() => onRespondCounterOffer(trip.bookingId, 'accepted')}>Accept offer</button>
                </>
              )}
              <button className="rl-button rl-button--outline" type="button" onClick={() => onMessage(trip)}>
                <span aria-hidden="true">💬︎</span> Message
              </button>
              <button className="rl-button rl-button--primary" type="button" onClick={() => onItinerary(trip)}>
                View itinerary
              </button>
              <button
                className="rl-button rl-button--danger"
                type="button"
                onClick={() => onCancelTrip(trip)}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling…' : 'Cancel trip'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rl-trip-card__note">
        <span aria-hidden="true">{trip.noteIcon}</span> {trip.note}
      </div>
    </article>
  );
}

function CompletedTripCard({ trip, onView, onBookAgain }) {
  return (
    <article className="rl-trip-card rl-trip-card--completed">
      <div className="rl-trip-card__main">
        <div className="rl-trip-card__media rl-trip-card__media--small">
          <img src={trip.image} alt="" />
        </div>

        <div className="rl-trip-card__body">
          <div className="rl-trip-card__top">
            <span className="rl-eyebrow">{trip.region}</span>
            <span className="rl-status rl-status--completed">
              <span aria-hidden="true">✓</span> Completed
            </span>
          </div>

          <h3>{trip.title}</h3>
          <p className="rl-trip-card__meta">
            {trip.dates} <span aria-hidden="true">·</span> {trip.duration.replace(' · ', ' · ')}
          </p>

          <div className="rl-trip-card__footer">
            <p className="rl-with-guide">
              <span aria-hidden="true">☺</span> With {trip.guide}
            </p>
            <div className="rl-trip-card__actions">
              <button className="rl-button rl-button--outline" type="button" onClick={() => onView(trip)}>
                View trip
              </button>
              <button className="rl-button rl-button--primary" type="button" onClick={() => onBookAgain(trip)}>
                <span aria-hidden="true">↻</span> Book again
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- Main component ---------- */

function TravelerDashboard({ currentUser, onPlanTrip }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [cancellingTripId, setCancellingTripId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(() => ({
    name: currentUser?.fullName || '',
    country: currentUser?.country || '',
    email: currentUser?.email || '',
    phone: currentUser?.telephoneNumber || '',
    passport: '',
    travelInterests: Array.isArray(currentUser?.travelInterests) ? currentUser.travelInterests : [],
  }));

  useEffect(() => {
    let isActive = true;
    Promise.all([getTrips(), getBookings()])
      .then(([tripResponse, bookingResponse]) => {
        if (!isActive) return;
        setTrips(Array.isArray(tripResponse?.trips) ? tripResponse.trips : []);
        const bookingList = Array.isArray(bookingResponse?.bookings) ? bookingResponse.bookings : [];
        setBookings(bookingList.filter((booking) => Number(booking.travelerId) === Number(currentUser?.id)));
      })
      .catch((error) => {
        if (isActive) setLoadError(error.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => { isActive = false; };
  }, [currentUser?.id]);

  const tripCards = trips.map((trip) => {
    const booking = bookings.find((item) => Number(item.tripId) === Number(trip.id));
    const activities = Array.isArray(trip.activities) ? trip.activities : [];
    const dates = [trip.startDate, trip.endDate].filter(Boolean).join(' – ') || 'Dates not set';
    const guideName = booking?.guide || 'Guide not selected';
    const guideInitials = guideName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    return {
      ...trip,
      tripStatus: trip.status,
      region: trip.destination,
      title: trip.destination,
      dates,
      duration: activities.length ? `${activities.length} planned activities` : 'Trip plan',
      stops: activities.slice(0, 3).map((activity) => activity.title),
      guide: guideName,
      guideInitials,
      contactId: booking?.id,
      bookingId: booking?.id,
      bookingStatus: booking?.status,
      status: trip.status === 'completed' ? 'completed' : booking?.status === 'accepted' ? 'confirmed' : 'pending',
      statusLabel: trip.status === 'completed'
        ? 'Completed'
        : booking?.status === 'accepted'
        ? 'Confirmed'
        : booking?.status === 'countered'
          ? 'Counter offer received'
          : booking
            ? 'Awaiting guide response'
            : 'Planning',
      note: booking?.message || 'Your trip plan is saved. Add a guide request when ready.',
      noteIcon: booking ? '◷' : '⌖',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    };
  });
  const upcomingTrips = tripCards.filter((trip) => !['completed', 'cancelled'].includes(trip.tripStatus));
  const completedTrips = tripCards.filter((trip) => trip.status === 'completed');
  const chatBookings = bookings.filter((booking) => ['accepted', 'countered'].includes(booking.status));
  const selectedBooking = chatBookings.find((booking) => Number(booking.id) === Number(selectedBookingId)) || chatBookings[0];
  const dashboardTabs = tabs.map((tab) => ({
    ...tab,
    count: tab.id === 'upcoming' ? upcomingTrips.length : tab.id === 'completed' ? completedTrips.length : chatBookings.length,
  }));

  const showNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const updateProfile = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const saveProfile = () => {
    setSaved(true);
    showNotice('Your profile changes have been saved.');
    window.setTimeout(() => setSaved(false), 2500);
  };

  const openChat = (trip) => {
    if (trip.contactId) setSelectedBookingId(trip.contactId);
    setActiveTab('chat');
  };

  const respondToOffer = async (bookingId, status) => {
    try {
      await respondToCounterOffer(bookingId, status);
      const { bookings: latestBookings } = await getBookings();
      setBookings((Array.isArray(latestBookings) ? latestBookings : []).filter((booking) => Number(booking.travelerId) === Number(currentUser?.id)));
      showNotice(status === 'accepted' ? 'Guide offer accepted.' : 'Guide offer declined.');
    } catch (error) {
      showNotice(error.message);
    }
  };

  const cancelPlannedTrip = async (trip) => {
    if (!window.confirm(`Cancel your trip to ${trip.destination}? This will remove it from your upcoming trips.`)) {
      return;
    }

    setCancellingTripId(trip.id);
    setNotice('');
    try {
      const { bookings: cancelledBookings = [] } = await cancelTrip(trip.id);
      setTrips((current) => current.map((item) => (
        Number(item.id) === Number(trip.id) ? { ...item, status: 'cancelled' } : item
      )));
      setBookings((current) => current.map((booking) => {
        const cancelled = cancelledBookings.find((item) => Number(item.id) === Number(booking.id));
        return cancelled ? { ...booking, ...cancelled } : booking;
      }));
      showNotice(`Your trip to ${trip.destination} was cancelled.`);
    } catch (error) {
      showNotice(error.message || 'Unable to cancel this trip. Please try again.');
    } finally {
      setCancellingTripId(null);
    }
  };

  return (
    <div className="rl-page">
      <div className="rl-shell">
        <main className="rl-main">
          <section className="rl-hero">
            <div>
              <p className="rl-eyebrow rl-eyebrow--accent">Your Sri Lanka, your way</p>
              <h1>Welcome back, {currentUser?.fullName || 'traveler'}.</h1>
              {/* <p className="rl-hero__sub">
                A little planning. A lot to look forward to. Your next chapter starts here.
              </p> */}
            </div>
            <div className="rl-hero__banner">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG6UlIo022RZ9TYwvUSJ3qmwNo-t9ACtyZbLkONkpJ3g&s=10"
                alt=""
              />
              {/* <span>
                <span aria-hidden="true">⌖</span> Slow days, south coast
              </span> */}
            </div>
          </section>

          <div className="rl-layout">
            <ProfileCard
              profile={profile}
              onChange={updateProfile}
              onSave={saveProfile}
              saved={saved}
            />

            <section className="rl-content">
              <div className="rl-tabs" role="tablist" aria-label="Dashboard views">
                    {dashboardTabs.map((tab) => (
                  <button
                    key={tab.id}
                    id={`rl-tab-${tab.id}`}
                    className={`rl-tab${activeTab === tab.id ? ' is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`rl-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span aria-hidden="true">{tab.icon}</span>
                    {tab.label}
                    <span className="rl-tab__count">{tab.count}</span>
                  </button>
                ))}
              </div>

              {notice && (
                <p className="rl-notice" role="status">{notice}</p>
              )}
              {loadError && <p className="rl-notice" role="alert">{loadError}</p>}
              {isLoading && <p className="rl-notice" role="status">Loading your trips…</p>}

              {/* ---------- Upcoming ---------- */}
              {activeTab === 'upcoming' && (
                <section
                  className="rl-panel"
                  id="rl-panel-upcoming"
                  role="tabpanel"
                  aria-labelledby="rl-tab-upcoming"
                >
                  <div className="rl-panel__heading">
                    <h2>Your next adventures</h2>
                    <button
                      className="rl-button rl-button--outline"
                      type="button"
                      onClick={onPlanTrip}
                    >
                      <span aria-hidden="true">+</span> Plan a new trip
                    </button>
                  </div>

                  <div className="rl-trip-list">
                    {upcomingTrips.map((trip) => (
                      <UpcomingTripCard
                        key={trip.id}
                        trip={trip}
                        onMessage={openChat}
                        onItinerary={(t) => showNotice(`Opening the itinerary for ${t.title}…`)}
                        onRespondCounterOffer={respondToOffer}
                        onCancelTrip={cancelPlannedTrip}
                        isCancelling={Number(cancellingTripId) === Number(trip.id)}
                      />
                    ))}
                    {!isLoading && upcomingTrips.length === 0 && (
                      <p className="rl-chat__empty">You haven’t planned a trip yet. Start a plan to see it here.</p>
                    )}
                  </div>
                </section>
              )}

              {/* ---------- Completed ---------- */}
              {activeTab === 'completed' && (
                <section
                  className="rl-panel"
                  id="rl-panel-completed"
                  role="tabpanel"
                  aria-labelledby="rl-tab-completed"
                >
                  <div className="rl-trip-list">
                    {completedTrips.map((trip) => (
                      <CompletedTripCard
                        key={trip.id}
                        trip={trip}
                        onView={(t) => showNotice(`Opening ${t.title}…`)}
                        onBookAgain={(t) => showNotice(`Let's plan another trip like ${t.title}.`)}
                      />
                    ))}
                    {!isLoading && completedTrips.length === 0 && (
                      <p className="rl-chat__empty">Completed trips will appear here.</p>
                    )}
                  </div>
                </section>
              )}

              {/* ---------- Chat ---------- */}
              {activeTab === 'chat' && (
                <section
                  className="rl-panel rl-chat"
                  id="rl-panel-chat"
                  role="tabpanel"
                  aria-labelledby="rl-tab-chat"
                >
                  <aside className="rl-chat__sidebar" aria-label="Your booking conversations">
                    <div className="rl-chat__sidebar-head"><h3>Booking chats</h3><span className="rl-pill">{chatBookings.length}</span></div>
                    <div className="rl-contact-list">
                      {chatBookings.map((booking) => (
                        <button className={`rl-contact${Number(selectedBooking?.id) === Number(booking.id) ? ' is-active' : ''}`} key={booking.id} type="button" onClick={() => setSelectedBookingId(booking.id)}>
                          <span className="rl-avatar rl-avatar--sm">{booking.guide.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
                          <span className="rl-contact__text"><strong>{booking.guide}</strong><small>{booking.title}</small><span>{booking.status}</span></span>
                        </button>
                      ))}
                    </div>
                    {chatBookings.length === 0 && <p className="rl-chat__empty">Accepted bookings and counteroffers will appear here.</p>}
                  </aside>
                  <div className="rl-conversation">
                    {selectedBooking
                      ? <BookingChat key={selectedBooking.id} bookingId={selectedBooking.id} currentUser={currentUser} otherName={selectedBooking.guide} />
                      : <p className="rl-chat__empty">There are no booking conversations yet.</p>}
                  </div>
                </section>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default TravelerDashboard;
