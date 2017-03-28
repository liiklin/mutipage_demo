var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

const debug = process.env.NODE_ENV !== 'production';

var entries = getEntry('webAppSrc/static/js/**/*.js', 'webAppSrc/static/js/');
var chunks = Object.keys(entries);
console.log('entries>>>',entries);
var config = {
	entry: entries,
	output: {
		path: path.join(__dirname, 'www/static/'),
		publicPath: '/static/',
		filename: 'js/[name].js',
		chunkFilename: 'js/[id].chunk.js?[chunkhash]'
	},
	module: {
		loaders: [ //加载器
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract('style', 'css')
			}, {
				test: /\.less$/,
				loader: ExtractTextPlugin.extract('css!less')
			}, {
				test: /\.html$/,
				loader: "html?-minimize" //避免压缩html,https://github.com/webpack/html-loader/issues/50
			}, {
				test: /\.(woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'file-loader?name=fonts/[name].[ext]'
			}, {
				test: /\.(png|jpe?g|gif|svg)$/,
				loader: 'url-loader?limit=8192&name=img/[name]-[hash].[ext]'
			}
		]
	},
	plugins: [
		new webpack.ProvidePlugin({ //加载jq
			$: 'jquery'
		}),
		new CommonsChunkPlugin({
			name: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
			chunks: chunks,
			minChunks: chunks.length // 提取所有entry共同依赖的模块
		}),
		new ExtractTextPlugin('styles/[name].css'), //单独使用link标签加载css并设置路径，相对于output配置中的publickPath
		debug ? function() {} : new UglifyJsPlugin({ //压缩代码
			compress: {
				warnings: false
			},
			except: ['$super', '$', 'exports', 'require'] //排除关键字
		}),
	]
};


var pages = Object.keys(getEntry('webAppSrc/view/**/*.html', 'webAppSrc/view/'));
pages.forEach(function(pathname) {
	var conf = {
		filename: '../../view/home/' + pathname + '.html', //生成的html存放路径，相对于path
		template: 'webAppSrc/view/' + pathname + '.html', //html模板路径
		inject: false, //js插入的位置，true/'head'/'body'/false
		// minify: { //压缩HTML文件
		// 	removeComments: true, //移除HTML中的注释
		// 	collapseWhitespace: false //删除空白符与换行符
		// }
	};
	if (pathname in config.entry) {
		// conf.favicon = path.resolve(__dirname, 'webAppSrc/static/img/favicon.ico');
		conf.inject = 'body';
		conf.chunks = ['vendors', pathname];
		conf.hash = true;
	}
	console.log(pathname);
	console.log(config.entry);
	config.plugins.push(new HtmlWebpackPlugin(conf));
});


module.exports = config;

function getEntry(globPath, pathDir) {
	var files = glob.sync(globPath);
	var entries = {},
		entry, dirname, basename, pathname, extname;

	for (var i = 0; i < files.length; i++) {
		entry = files[i];
		dirname = path.dirname(entry);
		extname = path.extname(entry);
		basename = path.basename(entry, extname);
		pathname = path.normalize(path.join(dirname,  basename));
		pathDir = path.normalize(pathDir);
		if(pathname.startsWith(pathDir)){
			pathname = pathname.substring(pathDir.length)
		}
		entries[pathname] = ['./' + entry];
	}
	return entries;
}
