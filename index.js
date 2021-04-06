const express = require('express');
const rateLimit = require("express-rate-limit");
const fetch = require('node-fetch');

require('dotenv').config();

const app = express();

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10 // limit each IP to 10 requests per windowMs
});

//  apply to all requests
app.use(limiter);


app.listen(process.env.PORT || 3000, () => {
    console.log("Server up");
});

app.get('/get_token', async (req, res) => {
    if (req.query.refresh_token != undefined) {
        res.json(await get_token(req.query.refresh_token));
    } else {
        res.status(400).json({ "message": "bad request" });
    }
});

/*********************************************************/

const url_meli_api = "https://api.mercadolibre.com/";

async function get_token(refresh_token) {
    let url = new URL(url_meli_api + "oauth/token");

    let params = {
        "grant_type": "refresh_token",
        "client_id": process.env.client_id,
        "client_secret": process.env.client_secret,
        "refresh_token": refresh_token
    }

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    let repsonse = await fetch(url, {
        method: 'POST'
    });

    let json = await repsonse.json();

    return { access_token: json.access_token };
}