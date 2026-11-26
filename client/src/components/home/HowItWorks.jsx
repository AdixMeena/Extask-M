import Reveal from '../Reveal.jsx';

const STEPS = [
  {
    title: 'Post the task',
    text: 'Say what needs doing, where, by when, and what you can pay.',
    example: '"Fix a leaking tap in Indore, ₹400, by Sunday."',
  },
  {
    title: 'Get bids',
    text: 'People who can do it send their price, their free time and a short note.',
    example: '"₹350. Today after 6 pm. I will bring a washer."',
  },
  {
    title: 'Pick one and get it done',
    text: 'Choose by price, rating and verification. Mark it complete, then rate each other.',
    example: 'Phone numbers are shared only after you hire.',
  },
];

export default function HowItWorks() {
  return (
    <section className="container section how">
      <Reveal className="how__intro">
        <h2>Three steps, no middleman staff</h2>
        <p>
          You are not limited to a company&apos;s service list or its price card. Trust comes from
          ratings and verified profiles.
        </p>
      </Reveal>
      <ol className="how__steps">
        {STEPS.map((step, index) => (
          <Reveal as="li" key={step.title} delay={index * 0.1} className="how__step">
            <span className="how__number" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <p className="how__example">{step.example}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
