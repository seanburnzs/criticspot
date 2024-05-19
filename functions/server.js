const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const serverless = require('serverless-http');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const password = process.env.MONGODB_PASSWORD;
const uri = `mongodb+srv://seanburnzs:${password}@criticspot.umg1fh4.mongodb.net/?retryWrites=true&w=majority&appName=criticSpot`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
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

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const session_secret = process.env.SESSION_SECRET;

const generateRandomString = length => crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
const stateKey = 'spotify_auth_state';

app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());
app.use(session({
    store: MongoStore.create({ clientPromise: client.connect() }),
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));

app.get('/', (req, res) => {
    console.log('Serving login page');
    res.render('login');
});

app.get('/login', (req, res) => {
    console.log('Handling login request');
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    const scope = 'user-read-private user-read-email user-top-read';
    res.redirect('https://accounts.spotify.com/authorize?' + new URLSearchParams({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
    }).toString());
});

app.get('/auth/spotify/callback', async (req, res) => {
    console.log('Handling Spotify callback');
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        console.error('State mismatch:', { state, storedState });
        return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }).toString());
    }

    res.clearCookie(stateKey);
    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: new URLSearchParams({
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            }).toString(),
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
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
    const time_range = req.query.time_range || 'medium_term';
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

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log('Listening on http://localhost:3000');
    });
}

module.exports = serverless(app);
