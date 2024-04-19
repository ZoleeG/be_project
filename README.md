# Northcoders News API
### What does this api do?

Handles a database, making it useable for the client by providing endpoints that the client can use to retrieve data as required.  
For details, please visit the [hosted version](https://be-project-7l6i.onrender.com/api).


### How to set up this API:

1) Go to [the repo of this project](https://github.com/ZoleeG/be_project)
2) Clone the repo down: click on the drop-down button "CODE", copy url. Go to a desired directory in your terminal to home this repo, and run the following:<br> 
```
git clone https://github.com/ZoleeG/be_project
```
3) In the root of your cloned repo:<br>
    - Create two .env files: .env.test and .env.development. Into each, add PGDATABASE=, with the correct database name. (You will find the name of the databases in the setup.sql file inside the db folder.)
    - Create a file called .gitignore, and add node_modules and .env* to it.


### How to install dependencies?

1) In your terminal, make sure you are in the root of this repo.
2) And run the following command:<br>
```
npm i
```
<br>
(This will install all the dependencies that are listed in our package.json file.)

### How to seed local database?

There are scripts prepaired in our package.json file to setup our databases.
Run these commands in the following order:
```
setup-dbs
```
```
npm seed
```

### How to run tests?

- To run a test you will have to use the prepared script from package.json by running:
```
npm run test
```  
<br>
  
 *Minimum version of Node.js: v21.5.0* <br> 
 *Minimum version a Postgres: 14.11*