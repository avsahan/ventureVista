import { useEffect, useState } from 'react';
import { registerGuide, registerTraveler } from '../api/auth';
import '../styles/Home.css';

const Home = ({ role, onBack }) => {
  const [form, setForm] = useState({
    fullName: '',
    telephoneNumber: '',
    email: '',
    password: '',
    country: '',
    travelInterests: [],
    baseLocation: '',
    yearsExperience: '',
    dailyRateLkr: '',
    sltdaLicenseNumber: '',
    languages: '',
    shortBio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => () => {
    if (profilePic?.preview) URL.revokeObjectURL(profilePic.preview);
  }, [profilePic]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setForm((current) => ({
      ...current,
      travelInterests: current.travelInterests.includes(interest)
        ? current.travelInterests.filter((item) => item !== interest)
        : [...current.travelInterests, interest],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = role === 'traveler'
        ? {
          fullName: form.fullName,
          telephoneNumber: form.telephoneNumber,
          email: form.email,
          password: form.password,
          country: form.country,
          travelInterests: form.travelInterests,
        }
        : {
          fullName: form.fullName,
          telephoneNumber: form.telephoneNumber,
          email: form.email,
          password: form.password,
          baseLocation: form.baseLocation,
          yearsExperience: Number(form.yearsExperience),
          dailyRateLkr: Number(form.dailyRateLkr),
          sltdaLicenseNumber: form.sltdaLicenseNumber,
          languages: form.languages.split(',').map((language) => language.trim()).filter(Boolean),
          shortBio: form.shortBio,
        };
      const response = role === 'traveler'
        ? await registerTraveler(payload)
        : await registerGuide(payload, profilePic?.file);
      setRegisteredUser(response.user);
    } catch (submitError) {
      const fieldErrors = Object.entries(submitError.details || {})
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join(' ');
      setError(fieldErrors || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      <button className="btn-back" type="button" onClick={onBack}>← Back to Login</button>

      {registeredUser ? (
        <section className="registration-card registration-success" aria-live="polite">
          <h2>Account created successfully</h2>
          <p className="subtitle">Your details were saved. You can now sign in.</p>
          <dl className="registered-user-details">
            <div><dt>Full name</dt><dd>{registeredUser.fullName}</dd></div>
            <div><dt>Email</dt><dd>{registeredUser.email}</dd></div>
            <div><dt>Account type</dt><dd>{registeredUser.role}</dd></div>
            {registeredUser.country && <div><dt>Country</dt><dd>{registeredUser.country}</dd></div>}
          </dl>
          <button type="button" className="btn-submit" onClick={onBack}>Continue to sign in</button>
        </section>
      ) : role === 'traveler' ? (
        <div className="registration-card">
          <h2>Traveler Registration</h2>
          <p className="subtitle">Discover local experiences and book Sri Lankan guides.</p>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="traveler-full-name">Full Name</label>
              <input id="traveler-full-name" name="fullName" type="text" autoComplete="name" placeholder="John Doe" value={form.fullName} onChange={updateField} minLength="2" maxLength="150" required />
            </div>

            <div className="form-group">
              <label htmlFor="traveler-phone">Telephone number</label>
              <input id="traveler-phone" name="telephoneNumber" type="tel" autoComplete="tel" placeholder="e.g. +94 77 123 4567" value={form.telephoneNumber} onChange={updateField} minLength="7" maxLength="20" required />
            </div>

            <div className="form-group">
              <label htmlFor="traveler-email">Email Address</label>
              <input id="traveler-email" name="email" type="email" autoComplete="email" placeholder="john@example.com" value={form.email} onChange={updateField} maxLength="254" required />
            </div>

            <div className="form-group">
              <label htmlFor="traveler-password">Password</label>
              <input id="traveler-password" name="password" type="password" autoComplete="new-password" placeholder="At least 12 characters" value={form.password} onChange={updateField} minLength="12" maxLength="72" required />
            </div>

            <div className="form-group full-width">
              <label htmlFor="traveler-country">Country of Origin</label>
              <input id="traveler-country" name="country" type="text" autoComplete="country-name" placeholder="e.g. Australia" value={form.country} onChange={updateField} minLength="2" maxLength="100" required />
            </div>

            <fieldset className="interest-options full-width">
              <legend>Travel Preferences</legend>
              {['Culture & Heritage', 'Hiking & Adventure', 'Beach & Water Sports', 'Wildlife & Safari'].map((interest) => (
                <label key={interest}>
                  <input type="checkbox" checked={form.travelInterests.includes(interest)} onChange={() => toggleInterest(interest)} />
                  <span>{interest}</span>
                </label>
              ))}
            </fieldset>

            {error && <p className="registration-error full-width" role="alert">{error}</p>}
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Complete Registration'}
            </button>
          </form>
        </div>
      ) : (
        <div className="registration-card">
          <h2>Tour Guide Registration</h2>
          <p className="subtitle">Set up your guide profile and connect with tourists.</p>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="profile-pic-upload full-width">
              <div className="profile-pic-circle">
                {profilePic ? <img src={profilePic.preview} alt="Guide profile preview" /> : <span aria-hidden="true">👤</span>}
              </div>
              <label className="form-group" htmlFor="guide-profile-photo">
                <span>Profile photo (optional, max 5 MB)</span>
                <input
                  id="guide-profile-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
                      setError('Choose an image file smaller than 5 MB.');
                      event.target.value = '';
                      return;
                    }
                    setError('');
                    setProfilePic({ file, preview: URL.createObjectURL(file) });
                  }}
                />
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="guide-full-name">Full Name</label>
              <input id="guide-full-name" name="fullName" type="text" autoComplete="name" placeholder="Nuwan Jayawardena" value={form.fullName} onChange={updateField} minLength="2" maxLength="150" required />
            </div>

            <div className="form-group">
              <label htmlFor="guide-phone">Contact Phone Number</label>
              <input id="guide-phone" name="telephoneNumber" type="tel" autoComplete="tel" placeholder="+94 77 123 4567" value={form.telephoneNumber} onChange={updateField} minLength="7" maxLength="20" required />
            </div>

            <div className="form-group">
              <label htmlFor="guide-email">Email Address</label>
              <input id="guide-email" name="email" type="email" autoComplete="email" placeholder="guide@example.com" value={form.email} onChange={updateField} maxLength="254" required />
            </div>

            <div className="form-group">
              <label htmlFor="guide-password">Password</label>
              <input id="guide-password" name="password" type="password" autoComplete="new-password" placeholder="At least 12 characters" value={form.password} onChange={updateField} minLength="12" maxLength="72" required />
            </div>

            <div className="form-group">
              <label htmlFor="guide-location">Base Location / Region</label>
              <input id="guide-location" name="baseLocation" type="text" placeholder="e.g. Ella & Central Highlands" value={form.baseLocation} onChange={updateField} minLength="2" maxLength="150" required />
            </div>

            <div className="form-group">
              <label htmlFor="guide-experience">Years of Experience</label>
              <input id="guide-experience" name="yearsExperience" type="number" min="0" max="80" step="1" placeholder="5" value={form.yearsExperience} onChange={updateField} required />
            </div>

            <div className="form-group">
              <label htmlFor="guide-rate">Daily Standard Rate (LKR)</label>
              <input id="guide-rate" name="dailyRateLkr" type="number" min="0" max="10000000" step="0.01" placeholder="12000" value={form.dailyRateLkr} onChange={updateField} required />
            </div>

            <div className="form-group">
              <label htmlFor="guide-license">SLTDA License Number</label>
              <input id="guide-license" name="sltdaLicenseNumber" type="text" placeholder="SLTDA/G/8942" value={form.sltdaLicenseNumber} onChange={updateField} minLength="2" maxLength="100" required />
            </div>

            <div className="form-group full-width">
              <label htmlFor="guide-languages">Spoken Languages</label>
              <input id="guide-languages" name="languages" type="text" placeholder="English, Sinhala, German" value={form.languages} onChange={updateField} required />
            </div>

            <div className="form-group full-width">
              <label htmlFor="guide-bio">Short Bio / About You</label>
              <textarea id="guide-bio" name="shortBio" rows="3" placeholder="Describe your guide expertise and favorite local spots..." value={form.shortBio} onChange={updateField} minLength="10" maxLength="500" required />
            </div>

            {error && <p className="registration-error full-width" role="alert">{error}</p>}
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting application…' : 'Register as Local Guide'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Home;
