import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sutragram-dev');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function run() {
  const admins = await User.find({ role: 'admin' });
  if (admins.length > 0) {
    console.log("Found admins:");
    admins.forEach(a => console.log(`Email: ${a.email}, ID: ${a._id}`));
  } else {
    console.log("No admins found in the database. Creating one...");
    // we would need to know what password hashing it uses.
  }
  process.exit(0);
}
run();
