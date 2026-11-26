import { fetchStats } from '../../api/tasks.js';
import { useAsync } from '../../hooks/useAsync.js';
import CountUp from '../CountUp.jsx';
import Pin from '../Pin.jsx';
import Reveal from '../Reveal.jsx';

const POSTERS = [
  'Working couples with no free weekend',
  'Students living in PGs and hostels',
  'Parents and elderly people who need a hand at home',
];

const DOERS = [
  'Carpenters, electricians, painters and tutors without a certificate',
  'College students who want part-time income',
  'Home makers and retired people with time and a skill',
];

const STATS = [
  ['openTasks', 'tasks open now'],
  ['bids', 'bids placed'],
  ['completedTasks', 'jobs completed'],
  ['members', 'members'],
];

export default function Community() {
  // The numbers are real counts. If they cannot load, the strip is left out.
  const { data } = useAsync(fetchStats, []);

  return (
    <>
      {data && (
        <section className="stats" aria-label="ExTask so far">
          <dl className="container stats__list">
            {STATS.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  <CountUp value={data.stats[key]} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="container section who">
        <Reveal className="note who__posters">
          <Pin />
          <h2>Need work done?</h2>
          <ul className="ticks">
            {POSTERS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="note note--teal who__doers" delay={0.12}>
          <Pin tone="teal" />
          <h2>Can do the work?</h2>
          <ul className="ticks">
            {DOERS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
