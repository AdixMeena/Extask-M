import { useState } from 'react';

/**
 * State for a simple form: values, a busy flag and the server's error messages.
 *
 * const form = useForm({ title: '' });
 * <FormField {...form.field('title')} />
 * <form onSubmit={form.handleSubmit((values) => createTask(values))}>
 */
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setMessage('');
  };

  const field = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event) => setValue(name, event.target.value),
  });

  const handleSubmit = (submit) => async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});
    setMessage('');
    try {
      await submit(values);
    } catch (error) {
      setErrors(error.fields ?? {});
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return { values, setValue, setValues, errors, message, busy, field, handleSubmit };
}
