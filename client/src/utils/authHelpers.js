import jwtDecode from 'jwt-decode';

export const getStoredAuth = () => {
  try {
    const raw = sessionStorage.getItem('scraperAuth');
    if (!raw) return null;

    const { token } = JSON.parse(raw);
    const decoded = jwtDecode(token);

    // Token expired?
    if (decoded.exp * 1000 < Date.now()) {
      clearStoredAuth();
      return null;
    }

    // Validate expected fields
    if (!decoded?.role || !decoded?.username || (!decoded?.id && !decoded?.userId)) {
      clearStoredAuth();
      return null;
    }

    return {
      token,
      role: decoded.role,
      username: decoded.username,
      userId: decoded.id || decoded.userId,
    };
  } catch (err) {
    clearStoredAuth();
    return null;
  }
};


export const setStoredAuth = (data) => {
  sessionStorage.setItem('scraperAuth', JSON.stringify(data));
};

export const clearStoredAuth = () => {
  sessionStorage.removeItem('scraperAuth');
};
