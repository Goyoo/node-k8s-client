var webpack = require('webpack')
var path = require('path')
var fs = require('fs')

var nodeModules = {}

fs.readdirSync('node_modules').filter(function(x) {
    return ['.bin'].indexOf(x) === -1
}).forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod
})

module.exports = {
    entry: './index.ts',
    output: {
        path: __dirname,
        filename: 'index.js',
        libraryTarget: 'this'
    },
    target: 'node',
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.json$/, loader: 'json-loader' }
        ]
    },
    resolve: {
        extensions: ['', '.ts', 'js']
    },
    externals: [nodeModules]
}
 