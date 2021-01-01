/**
 * TestModule.ts consists of the basic functions that will be used in unit
 * tests.
 */
import {expect} from 'chai';
import http from 'http';
import {Model} from '../api/model/struct';

export const sendRequest = (
  uri: string,
  method: string,
  callback: (d: Buffer) => any,
  data?: Model
) => {
  if (data !== undefined) {
    const dataStr: string = JSON.stringify(data);
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 8000,
      path: uri,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataStr.length,
      },
    };

    const request = http.request(options, res => {
      res.on('data', callback);
    });

    request.on('information', info => {
      expect(info.statusCode).to.equal(200);
    });

    request.write(dataStr);
    request.end();
  } else {
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 8000,
      path: uri,
      method: method,
    };

    const request = http.request(options, res => {
      res.on('data', callback);
    });

    request.on('information', info => {
      expect(info.statusCode).to.equal(200);
    });

    request.end();
  }
};
