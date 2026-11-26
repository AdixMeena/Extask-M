import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { rupees, timeAgo } from '../lib/format.js';
import { DURATION, EASE_OUT, stamp } from '../lib/motion.js';
import ConfirmButton from './ConfirmButton.jsx';
import Icon from './Icon.jsx';
import PersonLine from './PersonLine.jsx';

/**
 * The poster's view of all bids. New bids slide in. After hiring, a stamp lands
 * on the chosen bid and the others fade to grey.
 */
export default function BidList({ bids, taskOpen, onSelect }) {
  const still = useReducedMotion();

  return (
    <ul className="bids">
      <AnimatePresence initial={!still}>
        {bids.map((bid, index) => {
          const hired = bid.status === 'accepted';
          const passed = bid.status === 'rejected';

          return (
            <motion.li
              key={bid.id}
              className={`bid ${hired ? 'bid--hired' : ''} ${passed ? 'bid--passed' : ''}`}
              initial={still ? false : { opacity: 0, x: 36 }}
              animate={{ opacity: passed ? 0.62 : 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: DURATION.base,
                ease: EASE_OUT,
                delay: Math.min(index, 4) * 0.06,
              }}
            >
              <div className="bid__top">
                <PersonLine person={bid.bidder} />
                <p className="bid__amount">{rupees(bid.amount)}</p>
              </div>
              {bid.message && <p>{bid.message}</p>}
              <ul className="meta">
                {bid.availability && (
                  <li>
                    <Icon name="clock" size={15} />
                    {bid.availability}
                  </li>
                )}
                <li>Sent {timeAgo(bid.created_at)}</li>
                {passed && <li>Not selected</li>}
              </ul>

              {taskOpen && bid.status === 'pending' && (
                <ConfirmButton
                  className="btn btn--primary btn--small"
                  question={`Hire ${bid.bidder.name} for ${rupees(bid.amount)}? All other bids will be declined.`}
                  confirmLabel="Yes, hire"
                  onConfirm={() => onSelect(bid)}
                >
                  Select this bid
                </ConfirmButton>
              )}

              {hired && (
                <motion.span
                  className="hired"
                  variants={stamp(-11)}
                  initial={still ? 'shown' : 'hidden'}
                  animate="shown"
                >
                  HIRED
                </motion.span>
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
