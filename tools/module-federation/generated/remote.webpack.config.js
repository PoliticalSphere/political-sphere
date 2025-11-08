// Remote webpack config (Module Federation) example
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Widget': './src/bootstrap'
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
};
