/**
 * BasicAPITest.ts
 * Consists of basic API test, single put and get.
 */
import {expect} from 'chai';
import {sendRequest} from '../../TestModule';
import {RequestError, RequestResult} from '../../../api/controller/struct';
import * as type from '../../../api/model/type';

describe('Basic API Test', () => {
  const newUser: type.User = {
    id: '1',
    inventory: '1234',
    firstName: 'John',
    lastName: 'Doe',
    email: 'jdoe@email.com',
    version: 1,
  };

  const newStash: type.Stash = {
    id: '1',
    owner: '1',
    name: 'Foo',
    next: '\0',
    child: '\0',
    createdDate: '2020-01-01',
    version: 1,
  };

  const newStash1: type.Stash = {
    id: '2',
    owner: '1',
    name: 'Foo1',
    next: '\0',
    child: '\0',
    createdDate: '2020-01-01',
    version: 1,
  };

  const newDirectory: type.Directory = {
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

  const newDirectory1: type.Directory = {
    id: '02',
    name: 'Bar1',
    owner: '1',
    stash: '1',
    parent: '1',
    next: '\0',
    child: '\0',
    createdDate: '2020-01-01',
    timestamp: '1002',
    version: 1,
  };

  const newFile: type.FileEntry = {
    id: '001',
    name: 'Car',
    owner: '1',
    stash: '1',
    parent: '01',
    next: '\0',
    content: 'Hello Cars!',
    createdDate: '2020-01-01',
    timestamp: '1001',
    version: 1,
  };

  const newFile1: type.FileEntry = {
    id: '002',
    name: 'Plane',
    owner: '1',
    stash: '1',
    parent: '01',
    next: '\0',
    content: 'Hello Planes!',
    createdDate: '2020-01-01',
    timestamp: '1003',
    version: 1,
  };

  const newFile2: type.FileEntry = {
    id: '003',
    name: 'Boat',
    owner: '1',
    stash: '1',
    parent: '01',
    next: '\0',
    content: 'Hello Cars!',
    createdDate: '2020-01-01',
    timestamp: '1005',
    version: 1,
  };

  describe('Put and Get 1 User', () => {
    it('Put a New User', done => {
      sendRequest(
        '/users',
        'PUT',
        d => {
          const res: RequestResult = JSON.parse(d.toString('utf8'));
          if (!res.success) console.log(res.message);
          done();
        },
        newUser
      );
    });

    it('Get the New User', done => {
      sendRequest('/users/1', 'GET', d => {
        const resPacket: type.User = JSON.parse(d.toString('utf8'));
        expect(resPacket).to.deep.equal(newUser);
        done();
      });
    });
  });

  describe('Put and Get 1 Stash', () => {
    it('Put a New Stash', done => {
      sendRequest(
        '/stash',
        'PUT',
        d => {
          const res: RequestResult = JSON.parse(d.toString('utf8'));
          if (!res.success) console.log(res.message);
          done();
        },
        newStash
      );
    });

    it('Get the New Stash', done => {
      sendRequest('/users/inventory/1234', 'GET', d => {
        const data: type.Stash[] = JSON.parse(d.toString('utf8'));
        expect(data).to.deep.include(newStash);
        done();
      });
    });
  });

  describe('Put and Get 1 Directory', () => {
    it('Put a New Directory', done => {
      sendRequest(
        '/stash/directory/',
        'PUT',
        d => {
          const res: RequestResult = JSON.parse(d.toString('utf8'));
          if (!res.success) console.log(res.message);
          done();
        },
        newDirectory
      );
    });

    it('Get the New Directory from Stash', done => {
      sendRequest('/stash/1', 'GET', d => {
        const resArray: type.ModelFile[] = JSON.parse(d.toString('utf-8'));
        expect(resArray).to.deep.include(newDirectory);
        done();
      });
    });

    it('Get the New Directory from Directory ID', done => {
      sendRequest('/stash/directory/01', 'GET', d => {
        const data: type.ModelFile[] = JSON.parse(d.toString('utf8'));
        expect(data).to.be.empty;
        done();
      });
    });
  });

  describe('Put and Get 1 File', () => {
    it('Put a New File', done => {
      sendRequest(
        '/stash/file/',
        'PUT',
        d => {
          const res: RequestResult = JSON.parse(d.toString('utf8'));
          if (!res.success) console.log(res.message);
          expect(res.success).to.be.true;
          done();
        },
        newFile
      );
    });

    it('Get the New File from Directory', done => {
      sendRequest('/stash/directory/01', 'GET', d => {
        const data: type.ModelFile[] = JSON.parse(d.toString('utf8'));
        expect(data).to.deep.include(newFile);
        done();
      });
    });

    it('Get the New File from File ID', done => {
      sendRequest('/stash/file/001', 'GET', d => {
        const data: type.FileEntry = JSON.parse(d.toString('utf8'));
        expect(data).to.deep.equal(newFile);
        done();
      });
    });
  });

  describe('Put and Get another Directory', () => {
    it('Put a New Directory', done => {
      sendRequest(
        '/stash/directory/',
        'PUT',
        d => {
          const res: RequestResult = JSON.parse(d.toString('utf-8'));
          if (!res.success) console.log(res.message);
          newDirectory1.next = newDirectory.id;
          expect(res.success).to.be.true;
          done();
        },
        newDirectory1
      );
    });

    it('Get the New Directory from Stash', done => {
      sendRequest('/stash/1', 'GET', d => {
        const data: type.ModelFile[] = JSON.parse(d.toString('utf-8'));
        expect(data).to.deep.include(newDirectory1, d.toString('utf-8'));
        done();
      });
    });

    it('Get the New Directory from Directory ID', done => {
      sendRequest(`/stash/directory/${newDirectory1.id}`, 'GET', d => {
        const data: type.ModelFile[] = JSON.parse(d.toString('utf-8'));
        expect(data).to.be.empty;
        done();
      });
    });
  });

  describe('Put and Get another File', () => {
    it('Put a New File', done => {
      sendRequest(
        '/stash/file/',
        'PUT',
        d => {
          const res: RequestResult = JSON.parse(d.toString('utf-8'));
          if (!res.success) console.log(res.message);
          newFile1.next = newFile.id;
          expect(res.success).to.be.true;
          done();
        },
        newFile1
      );
    });

    it('Get the New File from Directory', done => {
      sendRequest(`/stash/directory/${newFile1.parent}`, 'GET', d => {
        const data: type.ModelFile[] = JSON.parse(d.toString('utf8'));
        expect(data).to.deep.include(newFile1);
        done();
      });
    });

    it('Get the New File from File ID', done => {
      sendRequest(`/stash/file/${newFile1.id}`, 'GET', d => {
        const data: type.FileEntry = JSON.parse(d.toString('utf8'));
        expect(data).to.deep.equal(newFile1);
        done();
      });
    });
  });

  describe('Put and Get another Stash', () => {
    it('Put a New Stash', done => {
      sendRequest(
        '/stash',
        'PUT',
        d => {
          const res: RequestResult = JSON.parse(d.toString('utf8'));
          if (!res.success) console.log(res.message);
          newStash1.next = newStash.id;
          done();
        },
        newStash1
      );
    });

    it('Get the New Stash', done => {
      sendRequest('/users/inventory/1234', 'GET', d => {
        const data: type.Stash[] = JSON.parse(d.toString('utf8'));
        expect(data).to.deep.include(newStash1);
        done();
      });
    });
  });
});
