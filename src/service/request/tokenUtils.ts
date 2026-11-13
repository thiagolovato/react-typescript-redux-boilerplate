// Token management utilities
export const tokenUtils = {
  save: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  get: (): string | null => {
    return localStorage.getItem('authToken');
  },

  remove: () => {
    localStorage.removeItem('authToken');
  },

  isValid: (): boolean => {
    const token = tokenUtils.get();
    return !!token;
  },

  // Decode JWT token to get user info (without verification)
  decode: (token?: string): unknown | null => {
    try {
      const tokenToUse = token || tokenUtils.get();
      if (!tokenToUse) return null;

      const base64Url = tokenToUse.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
          window.atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join(''),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },


};
