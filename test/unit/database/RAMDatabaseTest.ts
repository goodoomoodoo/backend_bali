/**
 * RAMDatabaseTest.ts test Database for basic functions
 */
import {expect} from 'chai';
import {ResponsePacket} from '../../../api/controller/struct';
import RAMDatabase from '../../../api/database/ram/RAMDatabase';
import * as type from '../../../api/model/type';
import { LoggerWrapper } from '../../../winston/logger';


describe('Basic RAMDatabase Test', () => {
  const ramdb = new RAMDatabase(new LoggerWrapper('emerg', 'test', ''));

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
    it('Put a New User', () => {
      const res: ResponsePacket = {} as ResponsePacket;
      ramdb.putUser(newUser, res);
      expect(res.data.success).to.be.true;
    });

    it('Get the New User', () => {
      const res: type.UserPacket = {} as type.UserPacket;
      ramdb.getUser(newUser.id, res);
      expect(res.data).to.deep.equal(newUser);
    });
  });

  describe('Put and Get 1 Stash', () => {
    it('Put a New Stash', () => {
      const res: ResponsePacket = {} as ResponsePacket;
      ramdb.putStash(newStash, res);
      expect(res.data.success).to.be.true;
    });

    it('Get the New Stash from Inventory', () => {
      const res: type.StashPacket = {} as type.StashPacket;
      ramdb.getInventory(newUser.inventory, res);
      expect(res.data).to.deep.include(newStash);
    });

    it('Get the New Stash from Stash ID', () => {
      const res: type.DirectoryPacket = {} as type.DirectoryPacket;
      ramdb.getStash(newStash.id, res);
      expect(res.data).to.be.empty;
    });
  });

  describe('Put and Get 1 Directory', () => {
    it('Put a New Directory', () => {
      const res: ResponsePacket = {} as ResponsePacket;
      ramdb.putDirectory(newDirectory, res);
      expect(res.data.success).to.be.true;
    });

    it('Get the New Directory from Stash', () => {
      const res: type.DirectoryPacket = {} as type.DirectoryPacket;
      ramdb.getStash(newDirectory.parent, res);
      expect(res.data).to.deep.include(newDirectory);
    });

    it('Get the New Directory from Directory ID', () => {
      const res: type.DirectoryPacket = {} as type.DirectoryPacket;
      ramdb.getDirectory(newDirectory.id, res);
      expect(res.data).to.be.empty;
    });
  });

  describe('Put and Get 1 File', () => {
    it('Put a New File', () => {
      const res: ResponsePacket = {} as ResponsePacket;
      ramdb.putFileEntry(newFile, res);
      expect(res.data.success).to.be.true;
    });

    it('Get the New File from Directory', () => {
      const res: type.DirectoryPacket = {} as type.DirectoryPacket;
      ramdb.getDirectory(newFile.parent, res);
      expect(res.data).to.deep.include(newFile);
    });

    it('Get the New File from File ID', () => {
      const res: type.FileEntryPacket = {} as type.FileEntryPacket;
      ramdb.getFileEntry(newFile.id, res);
      expect(res.data).to.deep.equal(newFile);
    });
  });

  describe('Put and Get another Directory', () => {
    it('Put a New Directory', () => {
      const res: ResponsePacket = {} as ResponsePacket;
      ramdb.putDirectory(newDirectory1, res);
      newDirectory1.next = newDirectory.id;
      expect(res.data.success).to.be.true;
    });

    it('Get the New Directory from Stash', () => {
      const res: type.DirectoryPacket = {} as type.DirectoryPacket;
      ramdb.getStash(newDirectory1.parent, res);
      expect(res.data).to.deep.include(newDirectory1);
    });

    it('Get the New Directory from Directory ID', () => {
      const res: type.DirectoryPacket = {} as type.DirectoryPacket;
      ramdb.getDirectory(newDirectory1.id, res);
      expect(res.data).to.be.empty;
    });
  });

  describe('Put and Get another File', () => {
    it('Put a New File', () => {
      const res: ResponsePacket = {} as ResponsePacket;
      ramdb.putFileEntry(newFile1, res);
      newFile1.next = newFile.id;
      expect(res.data.success).to.be.true;
    });

    it('Get the New File from Directory', () => {
      const res: type.DirectoryPacket = {} as type.DirectoryPacket;
      ramdb.getDirectory(newFile1.parent, res);
      expect(res.data).to.deep.include(newFile1);
    });

    it('Get the New File from File ID', () => {
      const res: type.FileEntryPacket = {} as type.FileEntryPacket;
      ramdb.getFileEntry(newFile1.id, res);
      expect(res.data).to.deep.equal(newFile1);
    });
  });

  describe('Put and Get another Stash', () => {
    it('Put a New Stash', () => {
      const res: ResponsePacket = {} as ResponsePacket;
      ramdb.putStash(newStash1, res);
      newStash1.next = newStash.id;
      expect(res.data.success).to.be.true;
    });

    it('Get the New Stash', () => {
      const res: type.StashPacket = {} as type.StashPacket;
      ramdb.getInventory(newUser.inventory, res);
      expect(res.data).to.deep.include(newStash1);
    });
  });
});
