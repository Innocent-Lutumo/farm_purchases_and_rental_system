// api.js
export const verifyToken = async (token) => {
    const response = await fetch('/api/login/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Invalid token');
    return response.json();
  };