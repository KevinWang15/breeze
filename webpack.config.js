module.exports = {
  mode: "development",
  output: {
    filename: 'dist.js'
  },
  devServer: {
    inline: true,
    port: 7777
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [],
  module: {
    rules: [{
      test: /\.js[x]?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }, {
      test: /\.ts[x]?$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader'
      }
    },
      {test: /\.css$/, loader: 'style!css!postcss'},
      {test: /\.(png|jpg|gif)$/, loader: 'url?limit=12288'},
    ]
  },
  node: {},
};
