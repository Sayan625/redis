const express = require('express');
const axios = require('axios');
const redis = require('redis');

const redisClient = redis.createClient({
    password: 'US24tsxDbhozSJPBPnw1zGqYeTlakr5K',
    socket: {
        host: 'redis-11316.c264.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 11316
    }
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept',
};

redisClient.on('connect', () => {
  console.log('Redis connected');
});

const app = express();

app.use(express.json());

app.get('/people', async (req, res) => {
  try {
    const cachedData = await redisClient.get('people');
    if (cachedData !== null) {
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      let allData = [];
      for (let i = 1; i < 3; i++) {
        const resp = await axios.get(`https://swapi.dev/api/people/?page=${i}`);
        const data = resp.data;
        allData.push(...data.results);
      }
      redisClient.set('people', JSON.stringify(allData));
      return res.status(200).json(allData);
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.options('/people', (req, res) => {
  res.set(CORS_HEADERS).status(200).end();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
