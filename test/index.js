const assert = require('power-assert')
const Acyort = require('acyort')
const { defaults } = require('acyort-config')

const config = defaults

config.base = __dirname
config.cache =  true
config.scripts = ['builder.js']
config.scripts_dir = '/'
config.per_page = 2

const acyort = new Acyort(config)

acyort.build()
