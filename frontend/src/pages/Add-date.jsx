import { useState } from 'react';
import '../styles/AddDate.css';

const starterActivities = [];

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


function parseLocalDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function buildDays(startDate, endDate) {
  const firstDay = parseLocalDate(startDate);
  const lastDay = parseLocalDate(endDate);
  const dayCount = firstDay && lastDay
    ? Math.max(1, Math.round((lastDay - firstDay) / 86400000) + 1)
    : 3;

  return Array.from({ length: dayCount }, (_, index) => {
    const date = firstDay && lastDay
      ? addDays(firstDay, index)
      : index === 0 && firstDay
        ? firstDay
        : index === dayCount - 1 && lastDay
          ? lastDay
          : null;
    return {
      date,
      label: `DAY ${index + 1}${index === 0 ? ' · GUIDED' : ' · SELF-GUIDED'}`,
      formattedDate: date
        ? new Intl.DateTimeFormat('en', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(date)
        : 'Date not set',
    };
  });
}

function formatLkr(amount) {
  return `LKR ${amount.toLocaleString('en-LK')}`;
}

function AddDate({ tripDetails = {}, onBack, onHome, onContinue, onSaveTrip }) {
  const [activeDay, setActiveDay] = useState(0);
  const [activities, setActivities] = useState(() => (
    Array.isArray(tripDetails.activities) && tripDetails.activities.length
      ? tripDetails.activities
      : starterActivities
  ));
  const [budget, setBudget] = useState(Number(tripDetails.budget) || 60000);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const destination = tripDetails.destination?.trim() || 'Ella';
  const days = buildDays(tripDetails.startDate, tripDetails.endDate);
  const currentDay = days[activeDay] || days[0];
  const currentDayActivities = activities
    .filter((activity) => Number(activity.day) === activeDay)
    .sort((first, second) => first.time.localeCompare(second.time));
  const daySubtotal = currentDayActivities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
  const totalActivityCost = activities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
  const budgetUsedPercent = budget > 0
    ? Math.min(Math.round((totalActivityCost / budget) * 100), 100)
    : totalActivityCost > 0 ? 100 : 0;
  const roomToSpare = budget - totalActivityCost;
  const tripDateRange = tripDetails.startDate && tripDetails.endDate
    ? `${days[0].formattedDate} – ${days[days.length - 1].formattedDate}`
    : tripDetails.startDate
      ? `From ${days[0].formattedDate}`
      : tripDetails.endDate
        ? `Until ${days[days.length - 1].formattedDate}`
        : 'Choose your travel dates';

  const saveTrip = async (nextActivities = activities, nextBudget = budget) => {
    if (!onSaveTrip) return true;
    setIsSaving(true);
    setSaveMessage('');
    try {
      await onSaveTrip({
        destination,
        startDate: tripDetails.startDate || null,
        endDate: tripDetails.endDate || null,
        visibility: tripDetails.visibility || 'friends',
        budget: nextBudget,
        activities: nextActivities,
      });
      setSaveMessage('Trip saved');
      return true;
    } catch (error) {
      setSaveMessage(error.message || 'Unable to save the trip. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivitySubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const activity = {
      id: editingActivity?.id || globalThis.crypto?.randomUUID?.() || Date.now(),
      day: activeDay,
      time: formData.get('time'),
      duration: formData.get('duration').trim(),
      title: formData.get('title').trim(),
      desc: formData.get('description').trim(),
      location: formData.get('location').trim() || destination,
      tag: 'Personal plan',
      cost: Number(formData.get('cost')) || 0,
    };
    const nextActivities = editingActivity
      ? activities.map((item) => item.id === editingActivity.id ? activity : item)
      : [...activities, activity];

    setActivities(nextActivities);
    setEditingActivity(null);
    setShowActivityForm(false);
    await saveTrip(nextActivities);
  };

  const editActivity = (activity) => {
    setActiveDay(Number(activity.day));
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const deleteActivity = async (activityId) => {
    const nextActivities = activities.filter((activity) => activity.id !== activityId);
    setActivities(nextActivities);
    await saveTrip(nextActivities);
  };

  const openNewActivityForm = () => {
    setEditingActivity(null);
    setShowActivityForm(true);
  };

  const continueToGuides = async () => {
    if (await saveTrip()) onContinue();
  };

  return (
    <section className="itinerary-page">
      <button type="button" className="itinerary-btn-quiet" onClick={onBack}>← Back to trip details</button>
      <header className="itinerary-trip-header">
        <div className="itinerary-header-left">
          <h1>Your {destination} escape, thoughtfully planned.</h1>
          <p className="itinerary-trip-header__meta">
            <span>📍 {destination}</span>
            <span>📅 {tripDateRange}</span>
          </p>
          {saveMessage && (
            <p className={`itinerary-save-message${saveMessage === 'Trip saved' ? '' : ' is-error'}`} role="status">
              {saveMessage}
            </p>
          )}
        </div>
        <button
          type="button"
          className="itinerary-button itinerary-button--primary"
          onClick={() => saveTrip()}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save trip'}
        </button>
        <img
          className="itinerary-trip-header__image"
          src={destinationImages[destination] || destinationImages.Ella}
          alt={`Scenic view of ${destination}`}
        />
      </header>

      <div className="itinerary-layout">
        <section className="itinerary-schedule">
          <div className="itinerary-section-heading">
            <div>
              <h2>Day-by-Day Activity Planner</h2>
            </div>
            <button
              type="button"
              className="itinerary-button itinerary-button--primary"
              onClick={() => showActivityForm ? setShowActivityForm(false) : openNewActivityForm()}
            >
              {showActivityForm ? 'Cancel activity' : '+ Add Activity'}
            </button>
          </div>

          <div className="itinerary-day-tabs">
            {days.map((day, index) => {
              const dayCost = activities
                .filter((activity) => Number(activity.day) === index)
                .reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
              const count = activities.filter((activity) => Number(activity.day) === index).length;
              return (
                <button
                  type="button"
                  key={index}
                  className={`itinerary-day-tab ${activeDay === index ? 'is-active' : ''}`}
                  onClick={() => setActiveDay(index)}
                  aria-pressed={activeDay === index}
                >
                  <span className="itinerary-day-label">{day.label}</span>
                  <strong className="itinerary-day-date">{day.formattedDate}</strong>
                  <small className="itinerary-day-cost">
                    {formatLkr(dayCost)} · {count} {count === 1 ? 'activity' : 'activities'}
                  </small>
                </button>
              );
            })}
          </div>

          <div className="itinerary-section-subheading">
            <div>
              <h3>{destination} · Day {activeDay + 1}</h3>
              <p className="itinerary-subtext">
                {currentDay.formattedDate} · {currentDayActivities.length} {currentDayActivities.length === 1 ? 'activity' : 'activities'}
              </p>
            </div>
            <span className="itinerary-day-tag">DAY {activeDay + 1} OF {days.length}</span>
          </div>

          <button type="button" className="itinerary-add-day-btn" onClick={openNewActivityForm}>
            + Add Activity to Day {activeDay + 1}
          </button>

          {showActivityForm && (
            <form
              key={editingActivity?.id || `new-${activeDay}`}
              className="itinerary-add-activity-form"
              onSubmit={handleActivitySubmit}
            >
              <label>
                Activity
                <input name="title" maxLength="100" placeholder="e.g.:- take a dinner at a resturent" defaultValue={editingActivity?.title || ''} required />
              </label>
              <label>
                Time
                <input name="time" type="time" defaultValue={editingActivity?.time || '16:00'} required />
              </label>
              <label>
                Duration
                <input name="duration" placeholder="1 hour" maxLength="30" defaultValue={editingActivity?.duration || '1 hour'} required />
              </label>
              <label>
                Estimated cost (LKR)
                <input name="cost" type="number" min="0" max="100000000" step="100" defaultValue={editingActivity?.cost ?? 0} />
              </label>
              <label className="itinerary-add-activity-form__wide">
                Location
                <input name="location" placeholder={`e.g., ${destination}`} maxLength="150" defaultValue={editingActivity?.location || ''} />
              </label>
              <label className="itinerary-add-activity-form__wide">
                Notes
                <textarea name="description" rows="2" maxLength="500" placeholder="What would you like to do?" defaultValue={editingActivity?.desc || editingActivity?.description || ''} />
              </label>
              <div className="itinerary-add-activity-form__actions">
                <button
                  type="button"
                  className="itinerary-btn-quiet"
                  onClick={() => {
                    setShowActivityForm(false);
                    setEditingActivity(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="itinerary-btn-primary" disabled={isSaving}>
                  {editingActivity ? 'Save changes' : 'Add activity'}
                </button>
              </div>
            </form>
          )}

          <div className="itinerary-activity-list">
            {currentDayActivities.length ? currentDayActivities.map((activity) => (
              <article key={activity.id} className="itinerary-activity-card">
                <div className="itinerary-activity-time">
                  <strong>{activity.time}</strong>
                  <span>{activity.duration}</span>
                </div>
                <div className="itinerary-activity-body">
                  <div className="itinerary-activity-title-row">
                    <h4>{activity.title}</h4>
                    <div className="itinerary-activity-actions">
                      <button type="button" onClick={() => editActivity(activity)} aria-label={`Edit ${activity.title}`}>Edit</button>
                      <button type="button" onClick={() => deleteActivity(activity.id)} disabled={isSaving} aria-label={`Delete ${activity.title}`}>Delete</button>
                    </div>
                  </div>
                  {activity.desc && <p className="itinerary-activity-desc">{activity.desc}</p>}
                  <div className="itinerary-activity-footer">
                    <span className="itinerary-location">📍 {activity.location || destination}</span>
                    <div className="itinerary-cost-tag">
                      <strong>{formatLkr(Number(activity.cost || 0))}</strong>
                      {activity.tag && <span>{activity.tag}</span>}
                    </div>
                  </div>
                </div>
              </article>
            )) : (
              <p className="itinerary-empty-state">No activities planned for this day yet. Add one to get started.</p>
            )}
          </div>

          <div className="itinerary-day-subtotal-box">
            <div>
              <strong>Day {activeDay + 1} activity subtotal</strong>
              <p>Guide, stay, vehicle and meals are not included.</p>
            </div>
            <span className="itinerary-subtotal-amount">{formatLkr(daySubtotal)}</span>
          </div>
        </section>

        <aside className="itinerary-budget-sidebar">
          <div className="itinerary-budget-card">
            <div className="itinerary-budget-header">
              <h3>Live Budget Calculator</h3>
            </div>

            <div className="itinerary-budget-input-group">
              <label htmlFor="trip-budget">Your trip budget <small>LKR - Sri Lankan rupee</small></label>
              <div className="itinerary-budget-field">
                <span>LKR</span>
                <input
                  id="trip-budget"
                  type="number"
                  min="0"
                  max="1000000000"
                  step="1000"
                  value={budget}
                  onChange={(event) => setBudget(Math.max(0, Number(event.target.value) || 0))}
                />
                <button type="button" className="btn-step" onClick={() => setBudget((value) => Math.max(0, value - 5000))} aria-label="Decrease budget">-</button>
                <button type="button" className="btn-step" onClick={() => setBudget((value) => value + 5000)} aria-label="Increase budget">+</button>
              </div>
            </div>

            <div className="itinerary-budget-progress-block">
              <div className="itinerary-progress-text">
                <span>Budget used</span>
                <strong>{budgetUsedPercent}%</strong>
              </div>
              <div className="itinerary-progress-bar">
                <div className="itinerary-progress-fill" style={{ width: `${budgetUsedPercent}%` }}></div>
              </div>
              <div className="itinerary-spare-text">
                <span>{roomToSpare < 0 ? 'Over budget' : 'Room to spare'}</span>
                <strong>{formatLkr(Math.abs(roomToSpare))}</strong>
              </div>
            </div>

            <div className="itinerary-expenses-list">
              <h5>ESTIMATED EXPENSES <span>LKR</span></h5>
              <div className="itinerary-expense-row">
                <span className="exp-icon" aria-hidden="true">⛰️</span>
                <div className="exp-info">
                  <strong>Activities</strong>
                  <small>{activities.length} planned {activities.length === 1 ? 'activity' : 'activities'}</small>
                </div>
                <strong className="exp-amount">{totalActivityCost.toLocaleString('en-LK')}</strong>
              </div>
            </div>

            <div className="itinerary-total-footer-card">
              <div className="total-top">
                <span>Total activity cost</span>
                <strong>{formatLkr(totalActivityCost)}</strong>
              </div>
              <div className="total-bottom">
                <small>For the entire trip</small>
                <small>Budget: {formatLkr(budget)}</small>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="itinerary-bottom-bar">
        <button type="button" className="itinerary-btn-quiet" onClick={onHome}>
          ← Back to Home Page
        </button>
        <button type="button" className="itinerary-btn-primary" onClick={continueToGuides} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Continue / Find the Guides →'}
        </button>
      </footer>
    </section>
  );
}

export default AddDate;
