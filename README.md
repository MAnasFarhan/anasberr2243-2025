# anasberr2243-2025

WEEK 1 - LAB EXERCISE

## Description / Overview

The project focuses on setting up a development environment, understanding Git workflows, and building a simple Node.js script to connect to MongoDB, insert a document, and retrieve it.


## Installation Steps For Each Tools

* ### 1. VSCode
    * -> Downloaded VSCode from [code.visualstudio.com](code.visualstudio.com).
    * -> Download for Windows for Windows Users.
    * -> When .exe finish downloaded, open it or double clicked to Install. Use the default settings. Location files depends.
    * -> After done installing. Open VSCode. Go to View -> Extension and find "MongoDB for VSCode" extension.
    * -> Install the "MongoDB for VSCode" extension.

* ### 2. NodeJS & npm
    * -> Downloaded the LTS version of NodeJS from [nodejs.org](nodejs.org).
    * -> To make sure Node.js is properly installed, open Node.js cmd and configure.
    * -> Configure by running the following commands:
    ```sh
    node -v
    npm -v
    ```
    * -> No error means the Node.js is properly installed.
      
* ### 3. MongoDB
    * -> Follow the [MongoDB Community Server installation guide](https://www.mongodb.com/docs/manual/administration/install-community/).
    * -> After installed. Start MongoDB service by:  
    ```sh
    mongod --dbpath /path/to/data/directory
    ```
* ### 4. Git
    * -> Downloaded Git from [git-scm.com](git-scm.com).
    * -> Install Git using the default settings.
    * -> Configured Git username and email using the following commands:
    ```sh
        * git config --global user.name "Anas"
        * git config --global user.email "b12241241@gmail.com"
    ```
* ### 5. MongoDB Compass 
    * -> Download MongoDB Compass from the MongoDB Compass website. Choose the latest version.
    * -> MongoDB Compass Installed.

## Git Repository Setup

* -> Created a GitHub account .
* -> Created a new Git repository on GitHub. `anasberr2243-2025`
* -> Initialized a Git repository in the project directory: `git init`
* -> Added files to the staging area: `git add .`
* -> Committed the initial setup documentation: `git commit -m "first commit"`
* -> Pushed the changes to GitHub: `git push -u origin main`

## Project Setup 
1. Initialize a Node.js project:
   ```sh
   npm init -y
   ```
2. Install the MongoDB driver:
   ```sh
   npm install mongodb
   ```
3. Run the script:
   ```sh
   node index.js
   ```
4. Verify in MongoDB Compass:
   - Connect to your MongoDB instance.
     
5.Commit and push changes:
  ```sh
  git add .
  git commit -m "Initial commit"
  git push origin feature/setup
  ```
