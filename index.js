const path = require('path');
const express = require('express');
const app = express();
const config = require('./config.json');
const winston = require('winston');
const fs = require('fs');
const PORT = process.env.PORT || config.server.port;
const request = require('request');

process.env.NODE_ENV = config.mode;
app.use(require('morgan')(config.server.morgan));
app.use(require('compression')());
app.use(require('serve-static')(path.join(__dirname, config.server.static)));
app.use(express.static('public'));

if (config.mode === 'development') {
    const config = require('./webpack.config');
    const compiler = require('webpack')(config);

    app.use(require('webpack-dev-middleware')(compiler, {
        publicPath: config.output.publicPath,
    }));
    app.use(require('webpack-hot-middleware')(compiler));
}

app.get('/propiedades/:id', function (req, res) {
    fs.readFile(path.join(__dirname, './public/index_dwelling.html'), 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        const url = `https://sioc-be-test.herokuapp.com/api/dwellings/${req.params.id}`;
        const headers = {
            'content-type': 'application/json',
            Authorization: `Bearer null`
        };
        request(url, {headers: headers, method: 'GET'}, (error, response, body) => {
            if (error) {
                console.error("error", error);
                return;
            }

            body = JSON.parse(body);
            const dwelling = body.dwelling;
            if (!dwelling) {
                res.send("La propiedad no existe.");
                return;
            }

            const title = dwelling.occupationStatus === 'Disponible'? ' en '+dwelling.publicationType : dwelling.occupationStatus === 'Tasaciones'? ' en '+dwelling.occupationStatus : dwelling.occupationStatus;
            let backgroundImage = null;
            if (dwelling.headerImage && dwelling.headerImage.hasOwnProperty('secure_url')) {
                backgroundImage = dwelling.headerImage.secure_url;
            } else {
                if (dwelling.images.length > 0) backgroundImage = dwelling.images[0].secure_url;
                else backgroundImage = '';
            }

            data = data.replace(/\$OG_TITLE/g, dwelling.subtype + title + ' en ' + dwelling.address.streetName + ' ' + dwelling.address.streetNumber + ', ' + dwelling.address.city);
            data = data.replace(/\$OG_DESCRIPTION/g, dwelling.generalDescription);
            const result = data.replace(/\$OG_IMAGE/g, backgroundImage);
            res.send(result);
        });
    });
});

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, './public/index.html'), function(err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

require('http').createServer(app).listen(
    PORT,
    () => winston.info('Server started at port %s', config.server.port)
);
