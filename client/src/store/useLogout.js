import { useAppDispatch } from './hooks';
import { logout } from './slices/authSlice';
import { clearAllIssues } from './slices/issuesSlice';
import { clearAdminStats } from './slices/adminSlice';
import { resetFilters } from './slices/filterSlice';

export function useLogout() {
  const dispatch = useAppDispatch();

  return () => {
    dispatch(logout());
    dispatch(clearAllIssues());
    dispatch(clearAdminStats());
    dispatch(resetFilters());
  };
}
