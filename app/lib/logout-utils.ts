/**
 * Logout utilities for complete session cleanup
 */

/**
 * Performs complete logout - clears localStorage and invalidates server session
 */
export async function performCompleteLogout(): Promise<void> {
  try {
    // Get current access token for API logout
    const accessToken = localStorage.getItem('accessToken');
    
    console.log('Complete logout initiated');
    
    // Call API logout endpoint to invalidate server session
    if (accessToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        console.log('Server session invalidated successfully');
      } catch (error) {
        console.log('Server logout failed (but continuing with client logout):', error);
      }
    }
    
    // Clear all localStorage data completely
    localStorage.clear();
    
    // Also clear sessionStorage in case anything was stored there
    sessionStorage.clear();
    
    console.log('All client storage cleared successfully');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, clear all storage
    localStorage.clear();
    sessionStorage.clear();
  }
}

/**
 * Clears only authentication-related localStorage items
 */
export function clearAuthData(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  console.log('Authentication data cleared from localStorage');
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(): boolean {
  const user = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');
  return !!(user && accessToken);
}

/**
 * Gets current user data from localStorage
 */
export function getCurrentUserData(): any | null {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Validates that user has the required role
 */
export function hasRequiredRole(requiredRoles: string[]): boolean {
  const userData = getCurrentUserData();
  if (!userData || !userData.role) {
    return false;
  }
  return requiredRoles.includes(userData.role);
}
