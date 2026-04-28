import { User } from '../models/User.js';

function mapUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCredentials(body) {
  return {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
  };
}

export async function registerUser(req, res) {
  try {
    const { name, email } = normalizeCredentials(req.body);

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'This email is already registered. Please log in.' });
    }

    const user = await User.create({ name, email });
    return res.status(201).json({ user: mapUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to register right now.' });
  }
}

export async function loginUser(req, res) {
  try {
    const { name, email } = normalizeCredentials(req.body);

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found for this email. Please register first.' });
    }

    if (user.name.trim().toLowerCase() !== name.toLowerCase()) {
      return res.status(401).json({ message: 'Name does not match the registered account.' });
    }

    return res.json({ user: mapUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to login right now.' });
  }
}
