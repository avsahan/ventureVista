import '../styles/Footer.css';

const footerColumns = [
  {
    heading: 'Explore',
    links: [
      'Discover Destinations',
      'Plan Your Trip',
      'Local Guides',
      'My Trips',
    ],
  },
  {
    heading: 'Travelers',
    links: [
      'Create Account',
      'Find a Guide',
      'My Bookings',
      'Travel Planning',
    ],
  },
  {
    heading: 'Local Guides',
    links: [
      'Become a Guide',
      'Manage Bookings',
      'Guide Dashboard',
      'Contact Support',
    ],
  },
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="brand-block">
          <div className="footer-logo">V</div>

          <p>
            Discover Sri Lanka, plan your trips, and connect with local guides.
          </p>
        </div>

        {footerColumns.map((group) => (
          <div key={group.heading} className="footer-column">
            <h4>{group.heading}</h4>

            <ul>
              {group.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="newsletter">
          <h4>Plan Your Next Adventure</h4>

          <p>
            Explore destinations and make your next
            journey unforgettable with VentureVista.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} VentureVista.
          All rights reserved.
        </span>

        <div className="legal-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;