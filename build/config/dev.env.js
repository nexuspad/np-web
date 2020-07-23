'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // API_ENDPOINT: '"http://localhost:8080/api"'
  API_ENDPOINT: '"https://api.nexuspad.com/api"'
})
