import api from '../api';

// Login function
export const loginUser = async (credentials) => {
  const response = await api.post('/login', credentials);
  const { accessToken } = response.data.data;

  // Save token to localStorage
  localStorage.setItem('token', accessToken);

  return response.data;
};

// Logout function
export const logoutUser = async () => {
  await api.post('/logout');
  localStorage.removeItem('token');
};
