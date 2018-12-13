// webpack을 설치하자
// npm -i -g webpack webpack-cli && npm i -D webpack webpack-cli
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
  mode: 'development',
  entry: {
    app: '파일 경로',   // app.js 로 결과물이 떨어짐
    zero: '파일 경로',  // zero.js 로 결과물이 떨어짐
    merge: ['a.js', 'b.js'],  // a.js와 b.js가 엮여 하나의 merge.js로 만들어짐
    // 엔트리에 polyfill한 결과를 얻고 싶다면 다음과 같이 합니다.
    // vendor는 웹팩4에서는 자동으로 만들어 준다고 합니다.
    vendor: ['@babel/polyfill', 'eventsource-polyfill', 'react', 'react-dom'],
    app: ['@babel/polyfill', 'eventsource-polyfill', './client.js'],
  },
  output: {
    path: '/dist',    // 결과 파일들이 들어갈 경로
    filename: '[name].js',
    publicPath: '/',  // 파일들이 위치할 서버상의 경로
  },
  // 옵션 [hash] 웹팩이 빌드할 때마다 랜덤 문자열을 붙여줌 -> 캐시 삭제 시 유용
  // 옵션 [chunkhash] 웹팩이 빌드할 때 변경될 때만 랜덤 문자열을 달리 붙여줌 -> [hash] 보다 효율적

  // babel을 설치하자
  // npm i -D babel-loader @babel/core @babel/preset-env @babel/preset-react @babel/preset-stage-0
  // 이 중 babel-loader와 babel-core는 필수

  module: {
    rules: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      options: {
        presets: [
          [
            '@babel/preset-env', {
              targets: { node: 'current' }, // 노드일 경우만
              modules: 'false',   // false로 해야 트리 쉐이킹을 합니다.
            },
          ],
          '@babel/preset-react',
          '@babel/preset-stage-0',
        ],
      },
      exclude: ['/node_modules'],
    }, {  // npm i -D style-loader css-loader extract-text-webpack-plugin@next
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],  // loader를 사용하지 않고 use를 사용한 이유는 여러개를 동시에 사용하기 때문
                                            // (loader를 사용해도 무방하다고 한다..) 적용되는 순서는 있는 것 같다.
    }, {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({      // ExtractTextPlugin을 이용해 css파일자체로 추출
        fallback: 'style-loader',           // css-loader가 동작에 실패했을 때 style-loader가 돌겠다는 의미
        use: 'css-loader'                   // 서버 사이드에서는 style-loader, css-loader 대신 css-loader/locals로 적어야 한다고 한다.
      })                                    // 서버사이드 렌더링을 지원하기 위해서라고..
    }, {                      // npm i -D file-loader url-loader
      test: /\.(ico|png|jpg|jpeg|gif|svg|woff|owff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader',
      options: {
        name: '[hash].[ext]',     // 10000보다 큰 파일은 파일 자체로 사용한다.
        limit: 10000,             // 10000보다 작은 파일은 base64로 인코딩하여 처리
      }
    }
    ],
  },
  // rules 나 use 대신 loaders를 쓰고, options 대신 query를 쓰는 곳이 있다면 웹팩1이다. 웹팩2부터 바뀌었다.
  // 웹팩2부터는 babel-loader를 위처럼 모두 적어야 한다. 웹팩1에서는 babel만 적어도 됐었다.
  // 웹팩2부터는 json-loader가 내장되어서 별도로 정의하지 않는다.

  // 플러그인은 부가적인 기능입니다. ex) 압축, 핫리로딩, 복사 등
  plugins: [
    new webpack.LoaderOptionsPlugin({   // 로더들에게 옵션을 넣어 준다.
      minimize: true,                   // 이렇게 하면 모든 로더들이 미니파이한 결과로 처리를 하나봄
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),   // EnvironmentPlugin와 기능이 같음
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),  // 빌드 환경을 나타내는 것 같은데, 이게 대세라 함.
    new ExtractTextPlugin({
      filename: 'app.css',                      // ExtractTextPlugin을 이용해 css파일자체로 추출
    })
  ],
  // 이외에도 BannersPlugin, IgnorePlugin, COntextReplacementPlugin 등 많다.
  // 웹팩3에서 DedupePlugin은 사라짐, OccurrenceOrderPlugin은 디폴트임. OccurrenceOrderPlugin은 발생 횟수를 계산해서 최적화하는 녀석이라고 함..
  // 웹팩4에서는 ModuleConcatenationPlugin과 UglifyJsPlugin, NoEmitOnErrorsPlugin, NamedModules 플러그인이 사라지고
  // webpack.config.js에 optimization 속성으로 대체됨.
  optimization: {
    minimize: true/false,         // UglifyJsPlugin 계승, mode가 production일 때 자동 적용
    splitChunks: {},              // CommonsChunkPlugin을 계승, mode가 production일 때 자동 적용
    concatenateModules: true,     // ModuleConcatenationPlugin을 계승
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.json', '.jsx', '.css'],
  },
};