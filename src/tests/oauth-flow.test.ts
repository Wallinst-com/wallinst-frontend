import { api } from '../lib/api';

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('OAuth start endpoints (frontend)', () => {
  beforeEach(() => {
    // @ts-expect-error - test override
    global.fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        data: { authUrl: 'https://example.com/meta-auth' },
        meta: { timestamp: '2026-02-01T00:00:00Z', requestId: 'req-test' },
      })
    );
  });

  it('calls backend Instagram /oauth/instagram/start', async () => {
    await api.getInstagramAuthUrl();
    expect(global.fetch).toHaveBeenCalled();
    const [url] = (global.fetch as any).mock.calls[0];
    expect(String(url)).toContain('/api/oauth/instagram/start');
  });

  it('calls backend Facebook /oauth/facebook/start', async () => {
    await api.getFacebookAuthUrl();
    expect(global.fetch).toHaveBeenCalled();
    const [url] = (global.fetch as any).mock.calls[0];
    expect(String(url)).toContain('/api/oauth/facebook/start');
  });
});

