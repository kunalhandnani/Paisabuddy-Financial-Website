import bcrypt from 'bcryptjs';
import { connectDb } from '../_lib/db.js';
import { User } from '../_lib/User.js';
import { isValidEmail, mapUser, normalizeCredentials } from '../_lib/authHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDb();
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
