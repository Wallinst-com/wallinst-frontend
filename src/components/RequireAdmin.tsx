import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../lib/hooks';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!me) {
    return <Navigate to="/signin" replace />;
  }

  if (me.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}