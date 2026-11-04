import { useEffect, useState } from 'react';
import '../styles/GuideDashboard.css';
import { getAssetUrl, getBookings, updateBooking, updateGuideProfile } from '../api/auth';
import { openBookingSocket } from '../api/bookingSocket';
import BookingChat from '../components/BookingChat';

/* ---------- Icons ---------- */
const Icon = ({ children, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ClockIcon = (props) => (
  <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
);
const CircleCheckIcon = (props) => (
  <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></Icon>
);
const FilterIcon = (props) => (
  <Icon {...props}><path d="M3 6h18" /><path d="M7 12h10" /><path d="M10 18h4" /></Icon>
);
const CalendarIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </Icon>
);
const UserIcon = (props) => (
  <Icon {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>
);
const PencilIcon = (props) => (
  <Icon {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></Icon>
);
const PinIcon = (props) => (
  <Icon {...props}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);
const ChatIcon = (props) => (
  <Icon {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>
);
const CheckIcon = (props) => (
  <Icon {...props}><path d="m5 12 5 5L20 7" /></Icon>
);
const ArrowIcon = (props) => (
  <Icon {...props}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Icon>
);
const ChevronLeftIcon = (props) => (
  <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>
);
const ChevronRightIcon = (props) => (
  <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>
);

/* ---------- Data ---------- */
const statusLabels = {
  pending: 'Pending decision',
  countered: 'Counter offer sent',
  accepted: 'Confirmed',
  declined: 'Declined',
  cancelled: 'Cancelled by traveler',
};

const formatMoney = (amount) => `LKR ${amount.toLocaleString('en-US')}`;

function GuideStatus({ status }) {
  return (
    <span className={`gd-status gd-status--${status}`}>
      <span aria-hidden="true" /> {statusLabels[status]}
    </span>
  );
}

function GuideDashboard({ currentUser, onProfileUpdated }) {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [counterId, setCounterId] = useState(null);
  const [counterValue, setCounterValue] = useState('');
  const [chatBookingId, setChatBookingId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [bookingNotice, setBookingNotice] = useState('');
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const guideName = currentUser?.fullName || 'Local guide';
  const guideLocation = currentUser?.baseLocation || 'Sri Lanka';
  const guidePhoto = currentUser?.profilePhotoPath || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=85';
  const verificationStatus = currentUser?.verificationStatus || 'pending';

  const destinationImages = {
  Ella: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  Sigiriya: "https://images.unsplash.com/photo-1612862862126-865765df2ded?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  Colombo: "https://plus.unsplash.com/premium_photo-1733317260639-6fb8eb703c78?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  Galle: "https://plus.unsplash.com/premium_photo-1733342463294-946b7bec4b1f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  NuwaraEliya: "https://images.unsplash.com/photo-1619974643633-12acfdcedd16?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  Jaffna: "https://plus.unsplash.com/premium_photo-1689976472901-31911a474d4c?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  Trincomalee: "https://plus.unsplash.com/premium_photo-1675624628827-e4ec8857f720?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  Anuradhapura: "https://images.unsplash.com/photo-1759727257765-051ce04bd8b0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  Polonnaruwa: "https://images.unsplash.com/photo-1656339953897-e5d10d261ff1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  Habarana: "https://images.unsplash.com/photo-1742190361448-3354d969ee81?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
};


  useEffect(() => {
    let isActive = true;
    const socket = openBookingSocket();
    const handleTripCancelled = (booking) => {
      if (!booking || Number(booking.guideId) !== Number(currentUser?.id)) return;
      setRequests((current) => {
        const exists = current.some((request) => Number(request.id) === Number(booking.id));
        return exists
          ? current.map((request) => Number(request.id) === Number(booking.id) ? { ...request, ...booking } : request)
          : [...current, booking];
      });
      setBookingNotice(`Trip to ${booking.destination} was cancelled by ${booking.traveler}. The guide request has been cancelled.`);
    };

    getBookings()
      .then(({ bookings } = {}) => {
        if (isActive) {
          setRequests((current) => {
            const loaded = (Array.isArray(bookings) ? bookings : [])
              .filter((booking) => Number(booking.guideId) === Number(currentUser?.id));
            const realtimeBookings = current.filter((booking) => booking.status === 'cancelled');
            return [...loaded, ...realtimeBookings.filter((booking) => !loaded.some((item) => Number(item.id) === Number(booking.id)))];
          });
        }
      })
      .catch((error) => {
        if (isActive) setLoadError(error.message);
      });

    socket.on('booking:cancelled', handleTripCancelled);
    return () => {
      isActive = false;
      socket.off('booking:cancelled', handleTripCancelled);
      socket.disconnect();
    };
  }, [currentUser?.id]);

  const pending = requests.filter((request) => ['pending', 'countered'].includes(request.status));
  const accepted = requests.filter((request) => request.status === 'accepted');

  const tabs = [
    { id: 'pending', label: 'Pending Requests', icon: <ClockIcon />, count: pending.length },
    { id: 'accepted', label: 'Accepted Trips', icon: <CircleCheckIcon />, count: accepted.length },
    { id: 'all', label: 'All Requests', icon: <FilterIcon />, count: requests.length },
    { id: 'chat', label: 'Messages', icon: <ChatIcon />, count: requests.filter((request) => request.status === 'accepted').length },
  ];

  const updateStatus = async (id, status) => {
    try {
      const { booking } = await updateBooking(id, { status });
      setRequests((current) => current.map((request) => (request.id === id ? { ...request, ...booking } : request)));
      setCounterId(null);
    } catch (error) {
      setLoadError(error.message);
    }
  };

  const sendCounter = async (id) => {
    const amount = Number(counterValue);
    if (!amount || amount <= 0) return;
    try {
      const { booking } = await updateBooking(id, { status: 'countered', counterOffer: amount });
      setRequests((current) => current.map((request) => (request.id === id ? { ...request, ...booking } : request)));
      setCounterId(null);
      setCounterValue('');
    } catch (error) {
      setLoadError(error.message);
    }
  };

  const openCounter = (id) => {
    setCounterId(id);
    setCounterValue('');
  };

  const messageTraveler = (id) => {
    setChatBookingId(id);
    setActiveTab('chat');
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const profile = {
      fullName: formData.get('fullName').trim(),
      telephoneNumber: formData.get('telephoneNumber').trim(),
      yearsExperience: Number(formData.get('yearsExperience')),
      dailyRateLkr: Number(formData.get('dailyRateLkr')),
      baseLocation: formData.get('baseLocation').trim(),
      languages: formData.get('languages').split(',').map((language) => language.trim()).filter(Boolean),
      shortBio: formData.get('shortBio').trim(),
      sltdaLicenseNumber: formData.get('sltdaLicenseNumber').trim(),
    };

    setIsSavingProfile(true);
    setProfileError('');
    try {
      const { user } = await updateGuideProfile(profile, profilePhoto);
      onProfileUpdated?.(user);
      setIsProfileEditorOpen(false);
      setProfilePhoto(null);
    } catch (error) {
      setProfileError(error.message || 'Unable to save your profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <main className="gd-dashboard">
        <div className="gd-dashboard__inner">
          {/* ---------- Profile ---------- */}
          <section className="gd-profile" aria-label="My guide profile">
            <div className="gd-profile__header">
              <h2>My profile</h2>
            </div>
            <div className="gd-profile__identity">
              <img className="gd-profile__photo" src={getAssetUrl(guidePhoto)} alt={guideName} />
              <h1>{guideName}</h1>
              <p>Local guide · {guideLocation}</p>
              <span className={`gd-profile__verification${verificationStatus === 'approved' ? ' is-approved' : ''}`}>
                <CircleCheckIcon size={14} />
                {verificationStatus === 'approved' ? 'Verified guide' : 'Pending verification'}
              </span>
            </div>
            <div className="gd-profile__details">
              <div className="gd-detail">
                <span>Full name</span>
                <strong>{guideName}</strong>
              </div>
              <div className="gd-detail">
                <span>Email address</span>
                <strong>{currentUser?.email || 'Not provided'}</strong>
              </div>
              <div className="gd-detail">
                <span>Contact phone</span>
                <strong>{currentUser?.telephoneNumber || 'Not provided'}</strong>
              </div>
              <div className="gd-detail">
                <span>Base location</span>
                <strong>{guideLocation}</strong>
              </div>
              <div className="gd-detail">
                <span>Experience</span>
                <strong>{Number(currentUser?.yearsExperience) || 0} years</strong>
              </div>
              <div className="gd-detail">
                <span>SLTDA license number</span>
                <strong>{currentUser?.sltdaLicenseNumber || 'Not provided'}</strong>
              </div>
              <div className="gd-detail gd-detail--languages">
                <span>Languages</span>
                <div className="gd-profile__languages">
                  {(Array.isArray(currentUser?.languages) ? currentUser.languages : []).length
                    ? currentUser.languages.map((language) => <span className="gd-language-chip" key={language}>{language}</span>)
                    : <strong>Not provided</strong>}
                </div>
              </div>
              <div className="gd-detail gd-detail--bio">
                <span>About you</span>
                <strong>{currentUser?.shortBio || 'Add a short introduction to your guide profile.'}</strong>
              </div>
              <div className="gd-fee">
                <span>Daily guiding fee</span>
                <strong>{formatMoney(Number(currentUser?.dailyRateLkr) || 0)} / day</strong>
                <small>{verificationStatus === 'approved' ? 'Available for booking' : 'Profile awaiting review'}</small>
              </div>
              <button
                className="gd-button gd-button--primary gd-profile__edit"
                type="button"
                onClick={() => {
                  setProfileError('');
                  setProfilePhoto(null);
                  setIsProfileEditorOpen(true);
                }}
              >
                <PencilIcon size={14} /> Edit profile details
              </button>
            </div>
          </section>

          <div className="gd-dashboard__content">
          {/* ---------- Tabs ---------- */}
          <div className="gd-tabs" role="tablist" aria-label="Guide dashboard sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`gd-tab-${tab.id}`}
                className={`gd-tab${activeTab === tab.id ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`gd-panel-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCounterId(null);
                }}
              >
                <span className="gd-tab__icon">{tab.icon}</span>
                {tab.label}
                <span className="gd-tab__count">{tab.count}</span>
              </button>
            ))}
          </div>

          {loadError && <p className="gd-empty" role="alert">{loadError}</p>}
          {bookingNotice && <p className="gd-booking-notice" role="status">{bookingNotice}</p>}

          {/* ---------- Pending ---------- */}
          {activeTab === 'pending' && (
            <section className="gd-panel" id="gd-panel-pending" role="tabpanel" aria-labelledby="gd-tab-pending">
              {pending.length === 0 && <p className="gd-empty">No pending requests right now.</p>}
              <div className="gd-request-list">
                {pending.map((request) => (
                  <article className="gd-request" key={request.id}>
                    <div className="gd-request__media">
                      <img 
                      src={destinationImages[request.location] || destinationImages.Ella}
                      alt={request.title} />
                      <span className="gd-chip">{request.location}</span>
                    </div>
                    <div className="gd-request__body">
                      <div className="gd-request__top">
                        <div>
                          <h3>{request.title}</h3>
                          <p className="gd-muted">
                            Requested by {request.traveler}
                            {request.travelerNote ? ` · ${request.travelerNote}` : ''}
                          </p>
                        </div>
                        <div className="gd-budget">
                          <span>Offered budget</span>
                          <strong>{formatMoney(request.budget)}</strong>
                        </div>
                      </div>

                      <div className="gd-facts">
                        <span><CalendarIcon size={14} />{request.dateLong}</span>
                        <span><UserIcon size={14} />{request.travelers} Traveler{request.travelers > 1 ? 's' : ''}</span>
                        <span><ClockIcon size={14} />{request.duration}</span>
                      </div>

                      <p className="gd-request__message">“{request.message}”</p>
                      <button
                        type="button"
                        className="gd-button gd-trip-details__trigger"
                        onClick={() => setSelectedTrip(request)}
                      >
                        View traveler trip details
                      </button>

                      <div className="gd-request__footer">
                        <GuideStatus status={request.status} />
                        {counterId === request.id ? (
                          <div className="gd-counter">
                            <input
                              type="number"
                              min="1"
                              placeholder="Your offer (LKR)"
                              aria-label="Counter offer amount"
                              value={counterValue}
                              onChange={(event) => setCounterValue(event.target.value)}
                            />
                            <button className="gd-button gd-button--primary" type="button" onClick={() => sendCounter(request.id)}>
                              Send offer
                            </button>
                            <button className="gd-button" type="button" onClick={() => setCounterId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div className="gd-actions">
                            <button className="gd-button" type="button" onClick={() => updateStatus(request.id, 'declined')}>Decline</button>
                            <button className="gd-button" type="button" onClick={() => openCounter(request.id)}>Counter Offer</button>
                            <button className="gd-button gd-button--primary" type="button" onClick={() => updateStatus(request.id, 'accepted')}>
                              <CheckIcon size={15} /> Accept Booking
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ---------- Accepted ---------- */}
          {activeTab === 'accepted' && (
            <section className="gd-panel" id="gd-panel-accepted" role="tabpanel" aria-labelledby="gd-tab-accepted">
              {accepted.length === 0 && <p className="gd-empty">No accepted trips yet.</p>}
              <div className="gd-request-list">
                {accepted.map((trip) => (
                  <article className="gd-trip" key={trip.id}>
                    <div className="gd-trip__top">
                      <img src={destinationImages[trip.title] || destinationImages.Ella}
                      alt={trip.title} />
                      <div className="gd-trip__info">
                        <GuideStatus status="accepted" />
                        <h3>{trip.title}</h3>
                        <p className="gd-muted gd-muted--icon"><PinIcon size={14} /> {trip.location}</p>
                        <div className="gd-facts gd-facts--plain">
                          <span><CalendarIcon size={14} />{trip.dateLong}</span>
                          <span><UserIcon size={14} />{trip.travelers} Travelers</span>
                          <span><ClockIcon size={14} />{trip.duration}</span>
                        </div>
                        <p className="gd-muted">Agreed guide fee: <strong>{formatMoney(trip.budget)}</strong></p>
                      </div>
                    </div>

                    <div className="gd-trip__bottom">
                      <div className="gd-itinerary">
                        <h4>Itinerary overview</h4>
                        {(Array.isArray(trip.itinerary) ? trip.itinerary : []).map((stop) => (
                          <div className="gd-stop" key={stop.time}>
                            <time>{stop.time}</time>
                            <div>
                              <strong>{stop.title}</strong>
                              <p>{stop.text}</p>
                            </div>
                          </div>
                        ))}
                        {!trip.itinerary && <p className="gd-muted">No itinerary added yet.</p>}
                      </div>

                      <aside className="gd-travelers" aria-label="Your travelers">
                        <h4>Your travelers</h4>

                        <div className="gd-travelers__who">
                          <span className="gd-travelers__avatar" aria-hidden="true">
                            {trip.travelerInitials || trip.traveler.charAt(0)}
                          </span>
                          <div>
                            <strong>{trip.traveler}</strong>
                            {trip.travelerNote && <p>{trip.travelerNote}</p>}
                          </div>
                        </div>

                        {trip.travelerAbout && <p className="gd-travelers__about">{trip.travelerAbout}</p>}

                        <blockquote className="gd-travelers__quote">
                          {trip.messageFrom && (
                            <span>{trip.messageFrom} · {trip.messageDate}</span>
                          )}
                          “{trip.message}”
                        </blockquote>

                        <button
                          className="gd-button gd-button--primary gd-travelers__button"
                          type="button"
                          onClick={() => messageTraveler(trip.id)}
                        >
                          <ChatIcon size={15} />
                          Message Traveler
                        </button>

                        <small className="gd-travelers__hint">
                          Keep meeting details and trip updates in your booking conversation.
                        </small>
                      </aside>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ---------- All requests ---------- */}
          {activeTab === 'all' && (
            <section className="gd-panel" id="gd-panel-all" role="tabpanel" aria-labelledby="gd-tab-all">
              <div className="gd-table-wrap">
                <table className="gd-table">
                  <thead>
                    <tr>
                      <th>Tour / booking</th>
                      <th>Traveler</th>
                      <th>Trip date</th>
                      <th>Guide fee</th>
                      <th>Status</th>
                      <th aria-label="Open booking" />
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div className="gd-table__tour">
                            <img src={destinationImages[request.location] || destinationImages.Ella}
                             alt="" />
                            <div>
                              <strong>{request.title}</strong>
                              <span>{request.location.split(',')[0]} · #{request.id}</span>
                              {request.status === 'cancelled' && (
                                <span className="gd-table__cancellation-note">{request.message}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{request.traveler}</strong>
                          <span>{request.travelers} traveler{request.travelers > 1 ? 's' : ''}</span>
                        </td>
                        <td>
                          <strong>{request.date}</strong>
                          <span>{request.duration}</span>
                        </td>
                        <td>
                          <strong>{formatMoney(request.budget)}</strong>
                          <span>{request.status === 'accepted' ? 'Agreed fee' : 'Offered budget'}</span>
                        </td>
                        <td><GuideStatus status={request.status} /></td>
                        <td className="gd-table__go">
                          <button type="button" aria-label={`View trip details for ${request.title}`} onClick={() => setSelectedTrip(request)}>
                            <ArrowIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="gd-pagination">
                  <span>Page 1 of 1</span>
                  <button type="button" aria-label="Previous page" disabled><ChevronLeftIcon size={14} /></button>
                  <button type="button" aria-label="Next page" disabled><ChevronRightIcon size={14} /></button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'chat' && (
            <section className="gd-panel" id="gd-panel-chat" role="tabpanel" aria-labelledby="gd-tab-chat">
              {requests.filter((request) => request.status === 'accepted').length === 0
                ? <p className="gd-empty">Accept a booking before messaging a traveler.</p>
                : <div className="gd-chat-list">
                  <div className="gd-chat-list__heading">
                    <div>
                      <h3>Your conversations</h3>
                      <p>Message travelers with confirmed bookings.</p>
                    </div>
                    <span>{requests.filter((request) => request.status === 'accepted').length} active</span>
                  </div>
                  {requests.filter((request) => request.status === 'accepted').map((booking) => (
                    <article className="gd-chat-item" key={booking.id}>
                      <div className="gd-chat-item__identity">
                        <span className="gd-chat-item__avatar" aria-hidden="true">
                          {(booking.traveler || 'T').trim().charAt(0).toUpperCase()}
                        </span>
                        <div className="gd-chat-item__details">
                          <strong>{booking.traveler}</strong>
                          <span>{booking.title}</span>
                          <small>{booking.dateLong}</small>
                        </div>
                      </div>
                      <button className="gd-button gd-button--primary gd-chat-item__button" type="button" onClick={() => setChatBookingId(booking.id)}>
                        <ChatIcon size={15} />
                        Open chat
                        <ArrowIcon size={14} />
                      </button>
                    </article>
                  ))}
                  {chatBookingId && (
                    <BookingChat
                      key={chatBookingId}
                      bookingId={chatBookingId}
                      currentUser={currentUser}
                      otherName={requests.find((booking) => booking.id === chatBookingId)?.traveler || 'Traveler'}
                    />
                  )}
                </div>}
            </section>
          )}
          </div>
        </div>
      </main>
      {selectedTrip && (
        <div
          className="gd-trip-details__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTrip(null);
          }}
        >
          <section
            className="gd-trip-details"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gd-trip-details-title"
          >
            <header className="gd-trip-details__header">
              <div>
                <p>Traveler trip plan</p>
                <h2 id="gd-trip-details-title">{selectedTrip.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedTrip(null)} aria-label="Close trip details">×</button>
            </header>
            <div className="gd-trip-details__facts">
              <div><span>Traveler</span><strong>{selectedTrip.traveler}</strong></div>
              <div><span>Travel dates</span><strong>{selectedTrip.duration}</strong></div>
              <div><span>Trip budget</span><strong>{formatMoney(selectedTrip.tripBudget || 0)}</strong></div>
              <div><span>Guide fee offered</span><strong>{formatMoney(selectedTrip.offeredBudget || 0)}</strong></div>
              <div><span>Trip visibility</span><strong>{selectedTrip.visibility || 'Not specified'}</strong></div>
            </div>
            <div className="gd-trip-details__activities">
              <h3>Planned activities</h3>
              {Array.isArray(selectedTrip.tripActivities) && selectedTrip.tripActivities.length > 0 ? (
                selectedTrip.tripActivities.map((activity, index) => (
                  <article className="gd-trip-details__activity" key={activity.id ?? `${activity.day}-${index}`}>
                    <div className="gd-trip-details__activity-heading">
                      <span>Day {Number(activity.day || 0) + 1}</span>
                      <strong>{activity.time || 'Time not set'}</strong>
                    </div>
                    <div>
                      <h4>{activity.title || activity.name || 'Activity'}</h4>
                      {(activity.desc || activity.description) && <p>{activity.desc || activity.description}</p>}
                      {activity.location && <span className="gd-trip-details__activity-location">{activity.location}</span>}
                      <div className="gd-trip-details__activity-meta">
                        {activity.duration && <span>{activity.duration}</span>}
                        <strong>{formatMoney(Number(activity.cost) || 0)}</strong>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p className="gd-muted">The traveler has not added activities to this trip yet.</p>
              )}
            </div>
          </section>
        </div>
      )}
      {isProfileEditorOpen && (
        <div
          className="gd-profile-modal__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSavingProfile) {
              setIsProfileEditorOpen(false);
            }
          }}
        >
          <section
            className="gd-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gd-profile-modal-title"
          >
            <div className="gd-profile-modal__header">
              <div>
                <h2 id="gd-profile-modal-title">Edit guide profile</h2>
                <p>Update the details travelers see on your profile.</p>
              </div>
              <button
                type="button"
                className="gd-profile-modal__close"
                onClick={() => setIsProfileEditorOpen(false)}
                disabled={isSavingProfile}
                aria-label="Close profile editor"
              >
                ×
              </button>
            </div>
            <form className="gd-profile-form" onSubmit={saveProfile}>
              <label>
                Full name
                <input name="fullName" defaultValue={currentUser?.fullName || ''} minLength="2" maxLength="150" required />
              </label>
              <label>
                Phone number
                <input name="telephoneNumber" type="tel" defaultValue={currentUser?.telephoneNumber || ''} minLength="7" maxLength="20" required />
              </label>
              <label>
                Base location
                <input name="baseLocation" defaultValue={currentUser?.baseLocation || ''} minLength="2" maxLength="150" required />
              </label>
              <label>
                Years of experience
                <input name="yearsExperience" type="number" min="0" max="80" defaultValue={currentUser?.yearsExperience ?? 0} required />
              </label>
              <label>
                Daily rate (LKR)
                <input name="dailyRateLkr" type="number" min="0" max="10000000" step="100" defaultValue={currentUser?.dailyRateLkr ?? 0} required />
              </label>
              <label>
                SLTDA license number
                <input name="sltdaLicenseNumber" defaultValue={currentUser?.sltdaLicenseNumber || ''} minLength="2" maxLength="100" required />
              </label>
              <label className="gd-profile-form__wide">
                Languages (comma-separated)
                <input name="languages" defaultValue={(currentUser?.languages || []).join(', ')} placeholder="English, Sinhala" required />
              </label>
              <label className="gd-profile-form__wide">
                About you
                <textarea name="shortBio" defaultValue={currentUser?.shortBio || ''} minLength="10" maxLength="500" rows="4" required />
              </label>
              <label className="gd-profile-form__wide">
                Profile photo (optional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => setProfilePhoto(event.target.files?.[0] || null)}
                />
                <small>JPG, PNG, WEBP, or GIF; maximum 5 MB.</small>
              </label>
              {profileError && <p className="gd-profile-form__error" role="alert">{profileError}</p>}
              <div className="gd-profile-form__actions">
                <button
                  type="button"
                  className="gd-button"
                  onClick={() => setIsProfileEditorOpen(false)}
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
                <button type="submit" className="gd-button gd-button--primary" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default GuideDashboard;
