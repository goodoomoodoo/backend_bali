Bali Sandbox
============

Bali Sandbox is my attempt to build a maintainable RESTful API framework. The
server uses winston to log requests and internal call flows, and it uses
TypeScript to implement OOP. The coding style of this project follow [Google's
TypesSript Style Guide](https://github.com/google/gts)

Summary:
- Bali Sandbox uses a database framework you can find under 
    api/database, and it provides the mutation, or the query, functions that
    needs to implemented in the database module.
- Bali Sandbox has a rather standard RESTful API server layout, and the 
    request routes can be find under api/controller.
- Bali Sandbox implements a model and a schema that stores file tree in the 
    database, and the viz of the schema can be found under api/model.
- Bali Sandbox comes with unit tests, and test types can be divided into
    sanity test, smoke test, and regression test.

Table of Contents
=================

- [Getting Started](#Getting-Started)
- [Design Choices](#Design-Choices)
    - [Schema](#Schema)
    - [Database](#Database)
    - [Test](#Test)
    


* TODO: Hash scheme uses base64 output