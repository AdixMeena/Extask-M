/** One error shape for the whole app, whatever went wrong. */
export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    /** { fieldName: message } for showing errors beside form inputs. */
    this.fields = {};
    for (const { field, message: text } of details ?? []) {
      this.fields[field] ??= text;
    }
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error;

  const response = error.response;
  if (!response) {
    return new ApiError('Cannot reach the ExTask server. Check your connection and try again.');
  }
  return new ApiError(response.data?.error?.message ?? 'Something went wrong. Please try again.', {
    status: response.status,
    details: response.data?.error?.details,
  });
}
