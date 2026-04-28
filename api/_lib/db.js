import mongoose from 'mongoose';

const globalForMongoose = globalThis;

if (!globalForMongoose.__paisabuddy_mongoose) {
  globalForMongoose.__paisabuddy_mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  const cached = globalForMongoose.__paisabuddy_mongoose;
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not set on this deployment.');
    }

    cached.promise = mongoose.connect(uri).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
