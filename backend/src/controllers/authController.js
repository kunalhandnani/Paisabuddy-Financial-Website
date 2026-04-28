import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

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
    password: String(body.password || ''),
  };
}

export async function registerUser(req, res) {
  try {
    const { name, email, password } = normalizeCredentials(req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'This email is already registered. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    return res.status(201).json({ user: mapUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to register right now.' });
  }
}

export async function loginUser(req, res) {
  try {
    const { name, email, password } = normalizeCredentials(req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
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

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    return res.json({ user: mapUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to login right now.' });
  }
}
