import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';

dotenv.config();

const port = Number(process.env.PORT || 5000);

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  });
