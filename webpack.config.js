const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');

// @ts-check
const config = /** @type { import('webpack').Configuration } */ {
    entry: {
        main: './src/main.ts',
        styles: './src/main.css',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: { transpileOnly: true },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.html$/,
                use: ['html-loader'],
            },
            {
                test: /\.(png|svg|jpg|gif|mp3)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]?[contenthash]',
                            context: 'src',
                        },
                    },
                ],
            },
            {},
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name]-[hash].js',
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: '[name]-[contenthash].js',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            favicon: './src/assets/favicon.png',
            chunks: ['main', 'styles'],
        }),
        new HtmlWebpackPlugin({
            filename: 'about.html',
            template: './src/about.html',
            favicon: './src/assets/favicon.png',
            chunks: ['styles'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name]-[contenthash].css',
        }),
    ],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        stats: 'errors-only',
        port: 8000,
    },
};

// https://stackoverflow.com/a/54482904
const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';
if (isProduction) {
    config.plugins.push(
        new PurgecssPlugin({
            paths: glob.sync('./src/**/*', { nodir: true }),
            keyframes: true,
        })
    );
}

module.exports = config;
