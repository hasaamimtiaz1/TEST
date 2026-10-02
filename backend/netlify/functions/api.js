const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../../src/app');

let connectionPromise = null;

function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
}

const expressHandler = serverless(app);

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();

  event.path = event.path.replace('/.netlify/functions/api', '/api');
  return expressHandler(event, context);
};
