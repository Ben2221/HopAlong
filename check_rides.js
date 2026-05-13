const mongoose = require('mongoose');
const { Ride } = require('./server/src/models/Ride');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/hopalong');
  const rides = await Ride.find({ isPublic: true, status: { $in: ['pending', 'accepted'] } }).populate('riders');
  console.log("Rides:");
  console.log(JSON.stringify(rides, null, 2));
  mongoose.disconnect();
}
check();
