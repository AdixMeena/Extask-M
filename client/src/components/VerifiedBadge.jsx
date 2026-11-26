import Icon from './Icon.jsx';

export default function VerifiedBadge({ compact = false }) {
  return (
    <span className="verified" title="ID checked by ExTask">
      <Icon name="shield" size={compact ? 15 : 17} />
      <span className={compact ? 'visually-hidden' : undefined}>Verified</span>
    </span>
  );
}
