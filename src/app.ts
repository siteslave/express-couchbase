/// <reference path="../typings.d.ts" />
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as HttpStatus from 'http-status-codes';
import * as express from 'express';
import * as cors from 'cors';
import rateLimit = require("express-rate-limit");
import helmet = require('helmet');

import * as couchbase from 'couchbase';

import { Router, Request, Response, NextFunction } from 'express';

// configure environment
require('dotenv').config({ path: path.join(__dirname, '../config') });

import { JwtModel } from './models/jwt';
import indexRoute from './routes/index';

const jwtModel = new JwtModel();

const router: Router = Router();
const app: express.Application = express();

//view engine setup
app.set('views', path.join(__dirname, '../views'));
app.engine('.ejs', ejs.renderFile);
app.set('view engine', 'ejs');

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'../public','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // limit each IP to 100 requests per windowMs
});

// limit for all route
app.use(limiter);
// limit for only route
// app.use("/api/", limiter);

app.use(cors());

const cluster = new couchbase.Cluster('couchbase://203.157.103.131/');
cluster.authenticate('admin', 'ict@M0pl-l');
var bucket = cluster.openBucket('fhirdb');

app.use((req: Request, res: Response, next: NextFunction) => {
  req.bucket = bucket;
  next();
});

const auth = async (req: Request, res: Response, next: NextFunction) => {
  var token: string = null;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else {
    token = req.body.token;
  }

  try {
    var decoded = await jwtModel.verify(token);
    req.decoded = decoded;
    next();
  } catch (error) {
    return res.send({
      ok: false,
      error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
      code: HttpStatus.UNAUTHORIZED
    });
  }
}

// app.use('/api', auth, indexRoute);
app.use('/', indexRoute);

//error handlers

if (process.env.NODE_ENV === 'development') {
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        ok: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
      }
    });
  });
}

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(HttpStatus.NOT_FOUND).json({
    error: {
      ok: false,
      code: HttpStatus.NOT_FOUND,
      error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
    }
  });
});

export default app;
