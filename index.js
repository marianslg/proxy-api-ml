const express = require('express');
const rateLimit = require("express-rate-limit");
const fetch = require('node-fetch');
var cors = require('cors')

require('dotenv').config();

const app = express();

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10 // limit each IP to 10 requests per windowMs
});

if(process.env.use_express_rate_limit == 1){
    app.use(limiter);
}

app.use(cors());

app.listen(process.env.PORT || 3000, () => {
    console.log("Server up");
});

app.get('/generate_token', async (req, res) => {
    if (req.query.code != undefined) {
        res.json(await generate_token(req.query.code));
    } else {
        res.status(400).json({ "message": "bad request" });
    }
});

app.get('/refresh_token', async (req, res) => {
    if (req.query.refresh_token != undefined) {
        res.json(await refresh_token(req.query.refresh_token));
    } else {
        res.status(400).json({ "message": "bad request" });
    }
});


/*********************************************************/

const url_meli_api = "https://api.mercadolibre.com/";

async function refresh_token(refresh_token) {
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

    if (json.hasOwnProperty("access_token"))
        return { access_token: json.access_token };
    else
        return json;
}

async function generate_token(code) {
    let url = new URL(url_meli_api + "oauth/token");

    let params = {
        "grant_type": "authorization_code",
        "client_id": process.env.client_id,
        "client_secret": process.env.client_secret,
        "code": code,
        "redirect_uri": process.env.redirect_uri
    }

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    let repsonse = await fetch(url, {
        method: 'POST'
    });

    let json = await repsonse.json();

    if (json.hasOwnProperty("access_token") && json.hasOwnProperty("refresh_token"))
        return { access_token: json.access_token, refresh_token: json.refresh_token };
    else
        return json;
}