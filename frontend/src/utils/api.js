// API utility functions
export const apiUrl = (endpoint) => {
  const baseUrl = process.env.REACT_APP_API_URL || '';
  return `${baseUrl}${endpoint}`;
};

// Token management
export const getToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const getEmployeeToken = () => {
  return localStorage.getItem('employeeToken') || sessionStorage.getItem('employeeToken');
};

export const setToken = (token, remember = false) => {
  if (remember) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
};

export const setEmployeeToken = (token, remember = false) => {
  if (remember) {
    localStorage.setItem('employeeToken', token);
  } else {
    sessionStorage.setItem('employeeToken', token);
  }
};

export const clearTokens = () => {
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
    if (window.location.pathname !== '/hr-login' && window.location.pathname !== '/employee-login') {
      window.location.href = '/hr-login';
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

