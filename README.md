# Node Build Version Generator

[ ![Codeship Status for tqc/buildversion](https://codeship.com/projects/5d70ffc0-9fbb-0133-d0e6-6af23f5d89a3/status?branch=master)](https://codeship.com/projects/127956)

Generates a unique build identifier from multiple package versions and git commits. Assumes git is installed.

## Setup

    npm install --save buildversion

## Usage

    var buildVersion = require("buildversion");
    var data = buildVersion(["gitrunner", "package-path"]);

    {
        name: 'buildversion',
        version: '1.0.0',
        packages: {
            gitrunner: {
                name: 'gitrunner',
                version: '0.0.3',
                commit: '4ff9f2df1a51ac3417b99c801a7c88a885d5f8fe'
            },
            'package-path': {
                name: 'package-path',
                version: '0.0.1'
            }
        }
    }