import couchbase = require('couchbase');

declare global {
  namespace Express {
    export interface Request {
      bucket: couchbase.Bucket;
      decoded: any;
    }
  }
}
