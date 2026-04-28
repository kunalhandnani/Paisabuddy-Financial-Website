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

    return res.status(200).json({ user: mapUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to login right now.' });
  }
}
