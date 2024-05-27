const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const password = process.env.MONGODB_PASSWORD;
const uri = `mongodb+srv://seanburnzs:${password}@criticspot.umg1fh4.mongodb.net/?retryWrites=true&w=majority&appName=criticSpot`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: false,
  useUnifiedTopology: true,
  keepAlive: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error", error);
  }
}
run().catch(console.dir);

const app = express();

app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());
app.use(session({
    store: MongoStore.create({ clientPromise: client.connect() }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));

const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

const whitelist = ['*'];
app.use((req, res, next) => {
  const origin = req.get('referer');
  const isWhitelisted = whitelist.find((w) => origin && origin.includes(w));
  if (isWhitelisted) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
  }
  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
});

const setContext = (req, res, next) => {
  if (!req.context) req.context = {};
  next();
};
app.use(setContext);

app.get('/', (req, res) => {
  console.log('Serving login page');
  res.render('login');
});

app.get('/login', (req, res) => {
  console.log('Handling login request');
  try {
    const state = generateRandomString(16);
    res.cookie('spotify_auth_state', state);
    const scope = 'user-read-private user-read-email user-top-read';
    res.redirect('https://accounts.spotify.com/authorize?' + new URLSearchParams({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state
    }).toString());
  } catch (error) {
    console.error('Login request error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/auth/spotify/callback', async (req, res) => {
  console.log('Handling Spotify callback');
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

  if (state === null || state !== storedState) {
    console.error('State mismatch:', { state, storedState });
    return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }).toString());
  }

  res.clearCookie('spotify_auth_state');
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
      }).toString(),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
      },
    });

    const { access_token, refresh_token } = response.data;
    console.log('Tokens received:', { access_token, refresh_token });
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    res.redirect('/top/tracks');
  } catch (error) {
    console.error('Error during token exchange:', error.response ? error.response.data : error.message);
    res.redirect('/#' + new URLSearchParams({ error: 'invalid_token' }).toString());
  }
});

app.get('/top/:type', async (req, res) => {
  const type = req.params.type;
  const time_range = req.query.time_range || 'short_term';
  const limit = 50;
  const offset = req.query.offset || 0;

  console.log(`Fetching top ${type}`);
  if (!['tracks', 'artists'].includes(type)) {
    console.error('Invalid type:', type);
    return res.status(400).send('Invalid type. Must be either "tracks" or "artists".');
  }

  if (!req.session.accessToken) {
    console.log('No access token, redirecting to login');
    return res.redirect('/login');
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/me/top/${type}`, {
      headers: { 'Authorization': `Bearer ${req.session.accessToken}` },
      params: { time_range, limit, offset }
    });

    if (type === 'tracks') {
      console.log('Rendering top tracks');
      res.render('index', { tracks: response.data.items });
    } else if (type === 'artists') {
      console.log('Rendering top artists');
      res.render('top-artists', { artists: response.data.items });
    }
  } catch (error) {
    console.error('Error during API request:', error.response ? error.response.data : error.message);
    res.status(500).send('An error occurred while fetching top items.');
  }
});

app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
