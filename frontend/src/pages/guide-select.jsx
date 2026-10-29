import { useEffect, useMemo, useState } from 'react';
import { getAssetUrl, getGuides } from '../api/auth';
import '../styles/GuideSelect.css';

const formatMoney = (amount) => `LKR ${amount.toLocaleString('en-LK')}`;

function GuideProfileDialog({ guide, onClose, onRequest }) {
  if (!guide) return null;

  return (
    <div className="guide-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="guide-dialog" role="dialog" aria-modal="true" aria-labelledby="guide-dialog-title">
        <button className="guide-dialog__close" type="button" onClick={onClose} aria-label="Close guide profile">×</button>
        <img src={getAssetUrl(guide.image)} alt={guide.name} />
        <div className="guide-dialog__content">
          <p className="guide-eyebrow">Local guide · {guide.location}</p>
          <h2 id="guide-dialog-title">{guide.name}</h2>
          <p className="guide-card__specialty">{guide.specialty}</p>
          <p>{guide.description}</p>
          <div className="guide-dialog__footer">
            <strong>{formatMoney(guide.price)} <span>/ day</span></strong>
            <button type="button" className="guide-button guide-button--primary" onClick={() => onRequest(guide)}>
              Request guide
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function GuideSelect({ tripDetails = {}, onBack, onRequestGuide }) {
  const [guides, setGuides] = useState([]);
  const [query] = useState('');
  const [specialty] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [notice, setNotice] = useState('');
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [guideLoadError, setGuideLoadError] = useState('');
  const destination = tripDetails.destination?.trim() || 'Ella';

  useEffect(() => {
    let isMounted = true;
    getGuides()
      .then(({ guides: registeredGuides } = {}) => {
        if (isMounted) setGuides(Array.isArray(registeredGuides) ? registeredGuides : []);
      })
      .catch((error) => {
        if (isMounted) setGuideLoadError(error.message);
      })
      .finally(() => {
        if (isMounted) setIsLoadingGuides(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return guides.filter((guide) => {
      const matchesQuery = `${guide.name} ${guide.location} ${guide.specialty} ${guide.description} ${(guide.languages || []).join(' ')}`.toLowerCase().includes(normalizedQuery);
      const matchesSpecialty = specialty === 'all' || guide.specialty === specialty;
      return matchesQuery && matchesSpecialty;
    });
  }, [guides, query, specialty]);

  const requestGuide = async (guide) => {
    setNotice('');
    try {
      await onRequestGuide(guide);
      setNotice(`Your request for ${guide.name} was sent.`);
      setSelectedGuide(null);
    } catch (error) {
      setNotice(error.message);
    }
  };

  return (
    <main className="guide-page">
      <div className="guide-page__container">
        <div className="guide-page__topbar">
          <button type="button" className="guide-back" onClick={onBack}>← Back to itinerary</button>
          <span className="guide-trip-label">Your trip · {destination}</span>
        </div>

        <header className="guide-page__heading">
          <div>
            <p className="guide-eyebrow">Find your local expert</p>
            <h1>Make your {destination} escape unforgettable.</h1>
          </div>
          <img
            className="guide-page__destination-image"
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85"
            alt={`${destination} landscape`}
          />
        </header>

        <section className="guide-results" aria-labelledby="guide-results-title">
          <div className="guide-results__heading">
            <div>
              <p className="guide-eyebrow">Curated for your trip</p>
            </div>
            <div className="guide-filters">
              {/* <label className="guide-search">
                <span aria-hidden="true">⌕</span>
                <span className="visually-hidden">Search guides</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guides or places" />
              </label>
              <label className="visually-hidden" htmlFor="guide-specialty">Filter by specialty</label>
              <select id="guide-specialty" value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
                <option value="all">All specialties</option>
                {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
              </select> */}
            </div>
          </div>

          {notice && <p className="guide-notice" role="status">{notice}</p>}
          {guideLoadError && <p className="guide-notice" role="status">Showing featured guides. Registered guides could not be loaded: {guideLoadError}</p>}
          {isLoadingGuides && <p className="guide-notice" role="status">Loading registered guides…</p>}

          <div className="guide-grid">
            {visibleGuides.map((guide) => (
              <article className="guide-card" key={guide.id || guide.name}>
                <div className="guide-card__photo-wrap">
                  <img className="guide-card__photo" src={getAssetUrl(guide.image)} alt={guide.name} loading="lazy" />
                  {/* <span className="guide-card__badge">
                    {guide.verificationStatus === 'pending' ? 'Pending verification' : 'Vetted local guide'}
                  </span> */}
                </div>
                <div className="guide-card__body">
                  <p className="guide-card__location"><span aria-hidden="true">●</span> {guide.location}</p>
                  <div className="guide-card__name-row">
                    <h3>{guide.name}</h3>
                    {/* {guide.rating
                      ? <span className="guide-card__rating" aria-label={`${guide.rating} out of 5 stars`}>★ {guide.rating}</span>
                      : <span className="guide-card__rating">New</span>} */}
                  </div>
                  <p className="guide-card__specialty">{guide.specialty}</p>
                  <p className="guide-card__description">{guide.description}</p>
                  <div className="guide-card__footer">
                    <strong>{formatMoney(guide.price)} <span>/ day</span></strong>
                    <div className="guide-card__actions">
                      <button type="button" className="guide-button guide-button--quiet" onClick={() => setSelectedGuide(guide)}>
                        View profile
                      </button>
                      <button type="button" className="guide-button guide-button--primary" onClick={() => requestGuide(guide)}>
                        Request guide
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleGuides.length === 0 && (
            <p className="guide-empty" role="status">No guides match those filters. Try a different name or specialty.</p>
          )}
        </section>

        <footer className="guide-page__footer">
          <span>All guides are locally based and reviewed by travelers.</span>
          <button type="button" className="guide-back" onClick={onBack}>Return to itinerary</button>
        </footer>
      </div>

      <GuideProfileDialog guide={selectedGuide} onClose={() => setSelectedGuide(null)} onRequest={requestGuide} />
    </main>
  );
}

export default GuideSelect;
