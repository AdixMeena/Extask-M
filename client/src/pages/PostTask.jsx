import { useNavigate } from 'react-router-dom';
import { createTask } from '../api/tasks.js';
import CategoryOptions from '../components/CategoryOptions.jsx';
import FormError from '../components/FormError.jsx';
import FormField from '../components/FormField.jsx';
import MoneyField from '../components/MoneyField.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useForm } from '../hooks/useForm.js';
import { useToast } from '../hooks/useToast.js';
import { todayInIndia } from '../lib/format.js';

export default function PostTask() {
  useDocumentTitle('Post a task');
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const form = useForm({
    title: '',
    description: '',
    category: '',
    budget: '',
    location: user.location ?? '',
    deadline: '',
  });

  const submit = form.handleSubmit(async (values) => {
    const { task } = await createTask(values);
    toast('Task posted');
    navigate(`/tasks/${task.id}`);
  });

  const { values } = form;
  const preview = {
    id: 'preview',
    status: 'open',
    bidCount: 0,
    title: values.title || 'Your task title',
    description: values.description || 'Your description shows up here as you type.',
    category: values.category,
    budget: values.budget,
    location: values.location,
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(values.deadline) ? values.deadline : null,
    poster: user,
  };

  return (
    <div className="container section post">
      <form className="stack" onSubmit={submit} noValidate>
        <h1>Post a task</h1>
        <FormField
          label="What needs doing?"
          required
          maxLength={120}
          placeholder="Fix a leaking tap"
          {...form.field('title')}
        />
        <FormField
          as="textarea"
          label="Details"
          required
          rows={5}
          maxLength={2000}
          placeholder="What is the problem? Anything to bring? Best time to come?"
          {...form.field('description')}
        />
        <div className="grid-two">
          <MoneyField label="Your budget" required placeholder="400" {...form.field('budget')} />
          <FormField
            label="Category"
            optional
            list="categories"
            maxLength={40}
            hint="Pick one or type your own."
            {...form.field('category')}
          />
          <FormField
            label="Location"
            optional
            maxLength={80}
            placeholder="Vijay Nagar, Indore"
            hint="Area and city. Do not put your full address here."
            {...form.field('location')}
          />
          <FormField
            label="Needed by"
            optional
            type="date"
            min={todayInIndia()}
            {...form.field('deadline')}
          />
        </div>
        <CategoryOptions id="categories" />
        <FormError>{form.message}</FormError>
        <button type="submit" className="btn btn--primary" disabled={form.busy}>
          {form.busy ? 'Posting' : 'Post task'}
        </button>
      </form>

      <aside className="post__preview" aria-label="Preview of your card">
        <p className="muted">How it will look on the board</p>
        <TaskCard task={preview} preview />
      </aside>
    </div>
  );
}
