import { User } from '../models/User.js';

function mapUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

export async function loginUser(req, res) {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name).trim();

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { name: normalizedName, email: normalizedEmail },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.json({ user: mapUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to login right now.' });
  }
}
