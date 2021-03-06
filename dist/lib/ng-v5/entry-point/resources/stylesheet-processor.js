'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const path = require('path');
const log = require('../../../util/log');
const shared_1 = require('../../../ng-package-format/shared');
const child_process_1 = require('child_process');
// CSS Tools
const autoprefixer = require('autoprefixer');
const browserslist = require('browserslist');
const nodeSassTildeImporter = require('node-sass-tilde-importer');
const postcss = require('postcss');
const postcssUrl = require('postcss-url');
const postcss_clean_1 = require('./postcss-clean');
const sass = require('node-sass');
const stylus = require('stylus');
class StylesheetProcessor {
  constructor(basePath, cssUrl, styleIncludePaths) {
    this.basePath = basePath;
    this.cssUrl = cssUrl;
    this.styleIncludePaths = styleIncludePaths;
    this.postCssProcessor = this.createPostCssProcessor(basePath, cssUrl);
  }
  process(filePath, content) {
    // Render pre-processor language (sass, styl, less)
    const renderedCss = this.renderPreProcessor(filePath, content);
    // Render postcss (autoprefixing and friends)
    const result = this.postCssProcessor.process(renderedCss, {
      from: filePath,
      to: filePath.replace(path.extname(filePath), '.css')
    });
    // Log warnings from postcss
    result.warnings().forEach(msg => log.warn(msg.toString()));
    return result.css;
  }
  renderPreProcessor(filePath, content) {
    const ext = path.extname(filePath);
    log.debug(`rendering ${ext} from ${filePath}`);
    switch (ext) {
      case '.sass':
      case '.scss':
        return sass
          .renderSync({
            file: filePath,
            data: content,
            indentedSyntax: '.sass' === ext,
            importer: nodeSassTildeImporter,
            includePaths: this.styleIncludePaths
          })
          .css.toString();
      case '.less':
        // this is the only way I found to make LESS sync
        let cmd = `node node_modules/less/bin/lessc ${filePath} --less-plugin-npm-import="prefix=~"`;
        if (this.styleIncludePaths.length) {
          cmd = `${cmd} --include-path=${this.styleIncludePaths.join(':')}`;
        }
        return child_process_1.execSync(cmd).toString();
      case '.styl':
      case '.stylus':
        return (
          stylus(content)
            // add paths for resolve
            .set('paths', [this.basePath, '.', ...this.styleIncludePaths, 'node_modules'])
            // add support for resolving plugins from node_modules
            .set('filename', filePath)
            // turn on url resolver in stylus, same as flag --resolve-url
            .set('resolve url', true)
            .define('url', stylus.resolver(undefined))
            .render()
        );
      case '.css':
      default:
        return content;
    }
  }
  createPostCssProcessor(basePath, cssUrl) {
    log.debug(`determine browserslist for ${basePath}`);
    const browsers = browserslist(undefined, { path: basePath });
    const postCssPlugins = [];
    if (cssUrl !== shared_1.CssUrl.none) {
      log.debug(`postcssUrl: ${cssUrl}`);
      postCssPlugins.push(postcssUrl({ url: cssUrl }));
    }
    // this is important to be executed post running `postcssUrl`
    postCssPlugins.push(
      autoprefixer({ browsers, grid: true }),
      postcss_clean_1.default({
        level: {
          2: {
            specialComments: false
          }
        }
      })
    );
    return postcss(postCssPlugins);
  }
}
exports.StylesheetProcessor = StylesheetProcessor;
//# sourceMappingURL=stylesheet-processor.js.map
