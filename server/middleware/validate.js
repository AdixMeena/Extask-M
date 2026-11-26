/**
 * Checks part of a request against a zod schema before the controller runs.
 * The cleaned values are placed on req.valid, so controllers only ever see
 * data that passed validation.
 *
 * @param {import('zod').ZodType} schema
 * @param {'body' | 'query' | 'params'} [source]
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    // A ZodError thrown here is formatted by the error handler.
    req.valid = { ...req.valid, [source]: schema.parse(req[source] ?? {}) };
    next();
  };
}
