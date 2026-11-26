import { rupees } from '../lib/format.js';
import Icon from './Icon.jsx';
import Pin from './Pin.jsx';

/** Shown only to the poster and the hired person, so they can arrange the job. */
export default function ContactCard({ contact, hired, isOwner }) {
  return (
    <div className="note note--teal stack-small">
      <Pin tone="teal" />
      <h2>{isOwner ? `You hired ${contact.name}` : `${contact.name} hired you`}</h2>
      <p>
        Agreed price <strong>{rupees(hired.amount)}</strong>
        {hired.availability ? `, ${hired.availability}` : ''}
      </p>
      <ul className="stack-small">
        {contact.phone && (
          <li>
            <a href={`tel:+91${contact.phone}`} className="contact">
              <Icon name="phone" />
              +91 {contact.phone}
            </a>
          </li>
        )}
        {contact.email && (
          <li>
            <a href={`mailto:${contact.email}`} className="contact">
              <Icon name="mail" />
              {contact.email}
            </a>
          </li>
        )}
      </ul>
      <p className="muted small">Only the two of you can see these details.</p>
    </div>
  );
}
