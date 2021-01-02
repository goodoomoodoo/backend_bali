# Bali Sandbox

Bali Sandbox is my attempt to build a maintainable RESTful API framework that
serves a file system, which allow user to read and write to the server. The
server uses winston to log requests and internal call flows, and it uses
TypeScript to implement OOP. The coding style of this project follow [Google's
TypesSript Style Guide](https://github.com/google/gts).

Summary:
- Bali Sandbox uses a database framework you can find under 
    api/database, and it provides the mutation, or the query, functions that
    needs to be implemented in the database module.
- Bali Sandbox has a rather standard RESTful API server layout, and the 
    request routes can be find under api/controller.
- Bali Sandbox implements a model and a schema that stores file tree in the 
    database, and the viz of the schema can be found under api/model.
- Bali Sandbox comes with unit tests, and test types can be divided into
    sanity test, smoke test, and regression test.

## Table of Contents

- [Getting Started](#Getting-Started)
- [Schema](#Schema)
- [Database](#Database)
    
## Getting Started

Clone the git repository to your local machine with your own choice of method,
and run the following commands.
```
# This will download all libraries and start the server in dev mode.
npm i && npm start
```

## Schema

The schema consists of User, Inventory, Stash, Directory, and FileEntry. The
User table stores the user tuple; the Inventory table stores the user's 
inventory tuple, containing a linked list of Stash tuple; The Stash table
acts as a node that contains a pointer to the next Stash tuple and a pointer to 
the root of a directory tree; The Directory table act as a node that contains 
a pointer to the next tuple, which could be another Directory tuple or a 
FileEntry tuple, and a pointer to the child, which could be a Directory tuple or
 a FileEntry tuple; The FileEntry table act as a node that contains pointer to 
the next tuple, which could be a Directory tuple or a FileEntry tuple.

### Design Rationale

The file system can be stored easily with an actual file system. However, 
filtering and sorting an actual file system can be quite resource intensive. 
Thus, the file system should be stored into a structure that conforms to the 
fundamental of database theory. The file system is divided into multiple tables 
based on BCNF.

What about the linked list? Why did I create some table as nodes?

For simple task such as when the user just want to get the stash, the directory,
 or the file, the database shouldn't have to iterate through the entire database
tree to find the requested item. Instead, the database can iterate through the
dedicated linked list to return the files. It is a very simple solution to a 
simple task, and I could not see much downside to doing this, but I am 
definitely open for any suggestions.

## Database

The schema and the model of this server serves merely as an interface and a 
medium to the actual database. Thus, I wanted the server to have ability to 
utilitize different database modules. So I implemented a Database Distributor
 and a Database library. The Database Distributor, which can be found under 
api/model/model.ts, has an instance of concrete Database module - any database
class that implements the database abstract class in the database library is 
considered a database module. The Database module can be specified in the 
server configuration, and the Database Distributor will run the specified
Database.

### Issues

The catch of this design is that each implemented database module needs to setup
 its schema according to the model schema from api/model/type, and this could be
 problematic since there will be two moving parts that requires sync constantly.
The most robust solution to this is to build a script or a framework that could 
reinforce the model schema and automatically sync in all database modules.
