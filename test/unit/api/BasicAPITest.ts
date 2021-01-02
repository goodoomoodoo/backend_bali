/**
 * BasicAPITest.ts
 * Consists of basic API test, single put and get.
 */
import {expect} from 'chai';
import http from 'http';
import {sendRequest} from '../../TestModule';
import {RequestError, RequestResult} from '../../../api/controller/struct';
import * as mod from '../../../api/model/type';

describe('Basic API Test', () => {
  const newUser: mod.User = {
    id: '1',
    inventory: '1234',
    firstName: 'John',
    lastName: 'Doe',
    email: 'jdoe@email.com',
    version: 1,
  };

  const newStash: mod.Stash = {
    id: '1',
    owner: '1',
    name: 'Foo',
    next: '\0',
    child: '\0',
    createdDate: '2020-01-01',
    version: 1,
  };

  const newDirectory: mod.Directory = {
    id: '01',
    name: 'Bar',
    owner: '1',
    stash: '1',
    parent: '1',
    next: '\0',
    child: '\0',
    createdDate: '2020-01-01',
    timestamp: '1000',
    version: 1,
  };

  describe('Put and Get 1 User', () => {
    it('Put a New User', done => {
      sendRequest('/users', 'PUT', d => {
        const res: RequestResult = JSON.parse(d.toString('utf8'));
        if (!res.success) console.log(res.message);
        done();
      }, newUser);
    });

    it('Get the New User', done => {
      sendRequest('/users/1', 'GET', d => {
        const resPacket: mod.User = JSON.parse(d.toString('utf8'));
        expect(resPacket).to.deep.equal(newUser);
        done();
      });
    });
  });

  describe('Put and Get 1 Stash', () => {
    it('Put a New Stash', done => {
      sendRequest('/stash', 'PUT', d => {
        const res: RequestResult = JSON.parse(d.toString('utf8'));
        if (!res.success) console.log(res.message);
        done();
      }, newStash);
    });

    it('Get the New Stash', done => {
      sendRequest('/users/inventory/1', 'GET', d => {
        const data: mod.Directory[] = JSON.parse(d.toString('utf8'));
        expect(data[0]).to.deep.equal(newStash);
        done();
      });
    });
  });

  describe('Put and Get 1 Directory', () => {
    it('Put a New Directory', done => {
      sendRequest('/stash/directory/', 'PUT', d => {
        const res: RequestResult = JSON.parse(d.toString('utf8'));
        if (!res.success) console.log(res.message);
        done();
      }, newDirectory);
    });

    it('Get the New Directory', done => {
      sendRequest('/stash/1', 'GET', d => {
        const resArray: mod.ModelItem[] = JSON.parse(d.toString('utf-8'));
        expect(resArray[0]).to.deep.equal(newDirectory);
        done();
      });
    });
  });
});
