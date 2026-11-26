import Reveal from './Reveal.jsx';
import TaskCard from './TaskCard.jsx';

/** A grid of task cards that appear one after another. */
export default function TaskBoard({ tasks }) {
  return (
    <ul className="board">
      {tasks.map((task, index) => (
        <Reveal as="li" key={task.id} delay={(index % 3) * 0.08}>
          <TaskCard task={task} />
        </Reveal>
      ))}
    </ul>
  );
}
