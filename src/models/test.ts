import * as couchbase from 'couchbase';

export class TestModel {

  testData(bucket: couchbase.Bucket) {
    return new Promise((resolve, reject) => {
      bucket.get('adasdasd', (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  testDataQuery(bucket: couchbase.Bucket, done: any) {
    var N1qlQuery = couchbase.N1qlQuery;
    var query = N1qlQuery.fromString('SELECT * FROM fhirdb');

    bucket.query(query, (err, rows) => {
      if (err) done(err, null);
      done(null, rows);
    });
  }

}