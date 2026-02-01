import { ApiError } from '../lib/api-client';


describe('ApiError', () => {
  it('stores code, message, and status', () => {
    const err = new ApiError('BAD_REQUEST', 'Bad', 400, { field: 'email' });
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.message).toBe('Bad');
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ field: 'email' });
  });
});
