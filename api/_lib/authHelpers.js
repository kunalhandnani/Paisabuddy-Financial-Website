export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function mapUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

export function normalizeCredentials(body) {
  return {
    name: String(body?.name || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    password: String(body?.password || ''),
  };
}
