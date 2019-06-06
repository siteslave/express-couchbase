/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
// import model
import { TestModel } from "../models/test";

const testModel = new TestModel();

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const results: any = await testModel.testData(req.bucket);
    res.send({ ok: true, results: results.value });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }

});

router.get('/query', async (req: Request, res: Response) => {
  try {
    testModel.testDataQuery(req.bucket, (err: any, rows: any) => {
      if (err) {
        res.send({ ok: false, error: err.message });
      } else {
        res.send({ ok: true, rows: rows });
      }
    });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }

});

export default router;
