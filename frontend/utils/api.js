// API utility functions for Next.js
export const apiUrl = (endpoint) => {
  // In Next.js, API routes are relative
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

// Token management
export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const getEmployeeToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('employeeToken') || sessionStorage.getItem('employeeToken');
};

export const setToken = (token, remember = false) => {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
};

export const setEmployeeToken = (token, remember = false) => {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem('employeeToken', token);
  } else {
    sessionStorage.setItem('employeeToken', token);
  }
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('employeeToken');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('employeeToken');
};

// API fetch with authentication
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken() || getEmployeeToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(endpoint), {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Token expired or invalid, clear tokens
    clearTokens();
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Don't redirect if already on a login page
      if (currentPath !== '/hr-login' && currentPath !== '/employee-login') {
        // Check if user is on employee portal or employee-related routes
        if (currentPath.startsWith('/employee') || currentPath === '/employee-portal') {
          window.location.href = '/employee-login';
        } else {
          // Default to HR login for admin routes
          window.location.href = '/hr-login';
        }
      }
    }
  }

  return response;
};

export const fetchProjects = async () => {
  try {
    const response = await fetch(apiUrl('/api/projects'));
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const fetchTestimonials = async () => {
  try {
    const response = await fetch(apiUrl('/api/testimonials'));
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    return await response.json();
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};



