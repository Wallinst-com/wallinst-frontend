import { authService } from '../lib/auth';


describe('authService', () => {
  it('starts unauthenticated by default', () => {
    localStorage.clear();
    authService.clearAuthPublic();
    const state = authService.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });
});
