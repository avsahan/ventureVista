import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import TravelHome from './pages/travel-Home';
import AddDate from './pages/Add-date';
import GuideSelect from './pages/guide-select';
import TravelerDashboard from './pages/TravelerDashboard';
import GuideDashboard from './pages/GuideDashboard';
import Permission from './pages/Permission';
import { createBooking, createTrip, getCurrentUser, logout, updateTrip } from './api/auth';
import './styles/App.css';
import DestinationDetails from './pages/DestinationDetails';




const featureCards = [
  {
    number: '01',
    category: 'SIGNATURE FEATURE',
    title: 'Hidden Local Gems',
    text: 'Find lesser-known places, local favorites and tips shared by people who know the area.',
    button: 'Explore local discoveries',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
    action: 'planning',
  },
  {
    number: '02',
    category: 'LOCAL CONNECTIONS',
    title: 'Meet Your Local Experts',
    text: 'Discover local guides and people offering transport, stays, food and unique experiences.',
    button: 'Find local services',
    image: '/image/Guider.jpg',
    action: 'planning',
  },
  {
    number: '03',
    category: 'PERSONALIZED JOURNEYS',
    title: 'Your Journey, Brought Together',
    text: 'Share your destinations, dates, group size and budget to shape a day-by-day travel plan.',
    button: 'Shape your journey',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85',
    action: 'planning',
  },
  {
    number: '04',
    category: 'SMARTER PLANNING',
    title: 'Know the Cost Before You Go',
    text: 'Explore estimated costs for transport, stays, food and activities to plan within your budget.',
    button: 'Explore trip costs',
    image: '/image/plan.jpg',
    action: 'planning',
  },
  {
    number: '05',
    category: 'TRAVEL WITH CONFIDENCE',
    title: 'Permissions, Made Easier',
    text: 'Get help identifying required permits, preparing documents and completing applications for your journey.',
    button: 'Get permit assistance',
    image: '/image/permit.jpg',
    action: 'permissions',
  },
  {
    number: '06',
    category: 'INSIDER KNOWLEDGE',
    title: 'The Local Lowdown',
    text: 'Get destination-specific warnings, access conditions, local advice and practical tips before setting off.',
    button: 'Check before you go',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=85',
    action: 'planning',
  },
];
;


const adventures = [

  {
    title: 'Ella',
    location: 'Badulla District, Sri Lanka',
    category: 'Mountains & Nature',
    description:
      'Discover scenic train rides, green hills, waterfalls and hidden mountain spots.',
    image: '/image/ella.jpg',
  },
  {
    title: 'Sigiriya',
    location: 'Central Province, Sri Lanka',
    category: 'History & Culture',
    description:
      'Explore the famous rock fortress, ancient history and beautiful surrounding landscapes.',
    image: '/image/Sigiriya1.jpg',
  },
  {
    title: 'Galle',
    location: 'Southern Province, Sri Lanka',
    category: 'Coast & Heritage',
    description:
      'Enjoy coastal scenery, historic streets, local food and the charm of Galle Fort.',
    image: '/image/galle.jpg',

  },
];


function LandingView({ onStartPlanning, onOpenPermissions, onExploreDestination, }) {
  return (
    <>
      <main className="home-page" id="home">
        <section className="hero-section">
          <h2>One app for all your travel planning needs</h2>
          <p>
            Create the detailed itineraries, explore user-shared guides, and manage your bookings seamlessly — all in one place.
          </p>
          <button className="primary-button" onClick={onStartPlanning}>Start planning</button>
        </section>

        <section className="feature-section" id="features">


          <div className="feature-grid">
            {featureCards.map((card) => (
              <article key={card.number} className="feature-card">
                <div className="feature-image">
                  <img src={card.image} alt={card.title} loading="lazy" />
                  <span className="feature-number">{card.number}</span>
                  <span className="feature-icon">{card.icon}</span>
                </div>


                <div className="feature-card-content">
                  <span className="feature-category">{card.category}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>


                  <button
                    type="button"
                    className="feature-link"
                    onClick={
                      card.action === 'permissions'
                        ? onOpenPermissions
                        : onStartPlanning
                    }
                  >
                    {card.button}
                    <span aria-hidden="true"> →</span>
                  </button>
                </div>
              </article>
            ))}
          </div>


          <button className="secondary-button" onClick={onStartPlanning}>
            Start planning adventure
          </button>
        </section>


        <section className="adventure-section" id="hotels">
          <span className="section-eyebrow">FIND YOUR INSPIRATION</span>

          <h2>Where will you go next?</h2>

          <p className="adventure-intro">
            Discover amazing destinations, local favorites and places
            worth exploring on your next journey.
          </p>

          <div className="adventure-grid">
            {adventures.map((item) => (
              <article key={item.title} className="adventure-card">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />

                <div className="adventure-copy">
                  <span className="adventure-location">
                    {item.category}
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <button
                    type="button"
                    onClick={() => onExploreDestination(item.title)}
                  >
                    Explore destination →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>


      </main>


    </>
  );
}


function App() {
  const [activePage, setActivePage] = useState('landing');
  const [selectedRole, setSelectedRole] = useState(null);
  const [tripDetails, setTripDetails] = useState({});
  const [pendingTrip, setPendingTrip] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('Ella');


  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then(({ user }) => {
        if (!isMounted) return;
        setCurrentUser(user);
        setActivePage(user.role === 'guide' ? 'guide-dashboard' : 'dashboard');
      })
      .catch(() => { })
      .finally(() => {
        isMounted = false;
      });
  }, []);

  const handleStartPlanning = () => {
    setActivePage('planner');
  };

  const handleExploreDestination = (destinationName) => {
    setSelectedDestination(destinationName);
    setActivePage('destination');
  };


  const tripPayload = (details) => ({
    destination: details.destination,
    startDate: details.startDate || null,
    endDate: details.endDate || null,
    visibility: details.visibility || 'friends',
    budget: Number(details.budget) || 60000,
    activities: details.activities || [],
  });


  const handleStartTrip = async (details) => {
    if (!currentUser) {
      setTripDetails({
        ...details,
        destination: details.destination.trim(),
        startDate: details.startDate || null,
        endDate: details.endDate || null,
        visibility: details.visibility || 'friends',
      });
      setAuthMessage('');
      setActivePage('itinerary');
      return;
    }
    if (currentUser.role !== 'traveler') {
      setAuthMessage('Only traveler accounts can create trips.');
      return;
    }


    try {
      const { trip } = await createTrip(tripPayload(details));
      setTripDetails({ ...details, ...trip });
      setAuthMessage('');
      setActivePage('itinerary');
    } catch (error) {
      setAuthMessage(error.message);
    }
  };


  const handleSaveTrip = async (details) => {
    if (!tripDetails.id && !currentUser) {
      setPendingTrip(details);
      setAuthMessage('Log in as a traveler to save your trip.');
      setActivePage('login');
      throw new Error('Log in as a traveler to save your trip.');
    }
    if (!tripDetails.id) throw new Error('Start a trip before saving the itinerary.');
    const { trip } = await updateTrip(tripDetails.id, tripPayload(details));
    setTripDetails((current) => ({ ...current, ...trip }));
    return trip;
  };


  const handleRequestGuide = async (guide) => {
    if (!tripDetails.id || !guide.id) {
      throw new Error('Save your trip and choose a registered guide to send a request.');
    }
    return createBooking(tripDetails.id, {
      guideId: guide.id,
      offeredBudget: guide.price || 0,
      message: `Please guide me in ${tripDetails.destination}.`,
    });
  };


  const handleFindGuides = () => {
    setActivePage('guides');
  };


  const handleAuthClick = () => {
    setAuthMessage('');
    setActivePage('login');
  };


  const navigateToLandingSection = (sectionId) => {
    setActivePage('landing');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };


  const handleLoginSuccess = async () => {
    const { user } = await getCurrentUser();
    setCurrentUser(user);
    setAuthMessage('');
    if (pendingTrip) {
      if (user.role !== 'traveler') {
        setAuthMessage('Sign in with a traveler account to save your trip.');
        setActivePage('guide-dashboard');
        return;
      }
      const { trip } = await createTrip(tripPayload(pendingTrip));
      setTripDetails({ ...pendingTrip, ...trip });
      setPendingTrip(null);
      setActivePage('itinerary');
      return;
    }
    setActivePage(user.role === 'guide' ? 'guide-dashboard' : 'dashboard');
  };


  const handleDashboardNavigation = () => {
    if (!currentUser) {
      setAuthMessage('Log in to view your dashboard.');
      setActivePage('login');
      return;
    }


    setAuthMessage('');
    setActivePage(currentUser.role === 'guide' ? 'guide-dashboard' : 'dashboard');
  };


  const handleGuideDashboardNavigation = () => {
    if (currentUser?.role !== 'guide') {
      setAuthMessage(currentUser
        ? 'The guide dashboard is only available to guide accounts.'
        : 'Log in with a guide account to open the guide dashboard.');
      setActivePage(currentUser ? 'dashboard' : 'login');
      return;
    }


    setAuthMessage('');
    setActivePage('guide-dashboard');
  };


  const handleLogout = async () => {
    try {
      await logout();
      setAuthMessage('');
      setCurrentUser(null);
      setActivePage('landing');
    } catch (error) {
      setAuthMessage(error.message);
    }
  };


  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setActivePage('registration');
  };


  const handleBackToLogin = () => {
    setActivePage('login');
    setSelectedRole(null);
  };


  return (
    <div className="app-main">
      <Header
        onAuthClick={handleAuthClick}
        onHomeClick={() => navigateToLandingSection('home')}
        onHotelsClick={() => navigateToLandingSection('hotels')}
        currentUser={currentUser}
        onLogout={handleLogout}
        authMessage={authMessage}
        onDashboardClick={handleDashboardNavigation}
        isDashboard={activePage === 'dashboard'}
        onGuideDashboardClick={handleGuideDashboardNavigation}
        isGuideDashboard={activePage === 'guide-dashboard'}
        onPermissionClick={() => setActivePage('permission')}
        isPermission={activePage === 'permission'}
      />
      <main className="content-body">


        {activePage === 'landing' && (
          <LandingView
            onStartPlanning={handleStartPlanning}
            onOpenPermissions={() => setActivePage('permission')}
            onExploreDestination={handleExploreDestination}
          />
        )}

        {activePage === 'destination' && (
          <DestinationDetails
            destinationName={selectedDestination}
            onBack={() => setActivePage('landing')}
            onStartPlanning={handleStartPlanning}
          />
        )}

        {activePage === 'login' && <Login onRoleSelect={handleRoleSelect} onLoginSuccess={handleLoginSuccess} />}
        {activePage === 'registration' && <Home role={selectedRole} onBack={handleBackToLogin} />}
        {activePage === 'planner' && <TravelHome onStartTrip={handleStartTrip} />}
        {activePage === 'itinerary' && (
          <AddDate
            tripDetails={tripDetails}
            onBack={() => setActivePage('planner')}
            onHome={() => setActivePage('landing')}
            onContinue={handleFindGuides}
            onSaveTrip={handleSaveTrip}
          />
        )}
        {activePage === 'guides' && (
          <GuideSelect tripDetails={tripDetails} onBack={() => setActivePage('itinerary')} onRequestGuide={handleRequestGuide} />
        )}
        {activePage === 'dashboard' && (
          <TravelerDashboard currentUser={currentUser} onPlanTrip={() => setActivePage('planner')} />
        )}
        {activePage === 'guide-dashboard' && (
          <GuideDashboard currentUser={currentUser} onProfileUpdated={setCurrentUser} />
        )}
        {activePage === 'permission' && (
          <Permission onCancel={() => setActivePage('landing')} />
        )}
      </main>
      {activePage === 'landing' && <Footer />}
    </div>
  );
}


export default App;