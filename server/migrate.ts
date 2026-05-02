/// <reference types="node" />
import mongoose from 'mongoose';
import { User } from './src/models/User';

const migrate = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hopalong');
    console.log('Connected to MongoDB');

    const adjectives = ['Swift', 'Electric', 'Silver', 'Cool', 'Urban', 'Wild', 'Neon', 'Golden'];
    const animals = ['Cheetah', 'Falcon', 'Raven', 'Panda', 'Shark', 'Wolf', 'Tiger', 'Lynx'];

    const users = await User.find({ 
      $or: [
        { pseudonym: { $exists: false } },
        { pseudonym: null },
        { walletBalance: { $exists: false } }
      ]
    });

    console.log(`Found ${users.length} users needing migration.`);

    for (const user of users) {
      if (!user.pseudonym) {
        user.pseudonym = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${animals[Math.floor(Math.random() * animals.length)]}${Math.floor(Math.random() * 100)}`;
      }
      if (user.walletBalance === undefined || user.walletBalance === null) {
        user.walletBalance = 1000;
      }
      await user.save();
      console.log(`Migrated user: ${user.email}`);
    }

    console.log('Migration successfully completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
