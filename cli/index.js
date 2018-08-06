#! /usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const {fork} = require('child_process');

const colors = require('colors');
const ora = require('ora');

const defaultCompiler = '1.1.0';

function error(msg) {
  console.log(msg.red.bold);
  process.exit();
}

function warn(msg) {
  console.log(msg.yellow.bold);
}

function success(msg) {
  console.log(msg.green.bold);
}

function info(msg) {
  console.log('['.gray + 'SaurScript'.magenta + ']'.gray, msg);
}

program
.version('1.1.0')
.command('build <saurfile> <outfile> [compiler]')
.action(function (file, outFile, compiler, cmd) {
  build(file, outFile, compiler);
});
program
.command('run <saurfile> <outfile> [compiler]')
.action(function (file, outFile, compiler, cmd) {
  build(file, outFile, compiler);
  info('Running: ' + outFile + '\nOutput:');
  fork(outFile);
});
program.parse(process.argv);

function build(file, outFile, compiler) {
  // Load the compiler:
  console.log(compiler);
  if (compiler == null) {
    compiler = defaultCompiler;
  }
  info('Locating compiler v' + compiler);
  let compilerPath = path.resolve(__dirname + '/../' + compiler + '/');
  if (!fs.existsSync(compilerPath)) {
    error("Compiler v" + compiler + " is not installed or doesn't exist.");
  }
  if (compiler == "1.0.0") {
    buildLegacy(file, outFile, compiler);
    return;
  }
  const Lexer = require('../' + compiler + '/lexer/lexer');
  const AST = require('../' + compiler + '/ast/AST');
  const Transpiler = require('../' + compiler + '/transpiler/transpiler');
  info("Using compiler " + "v".magenta + compiler.magenta + " at " + compilerPath.gray);

  // Read the saurfile:
  if (!fs.existsSync(file)) {
    error('\'.saur\' file \'' + file + '\' doesn\'t exist');
  }
  let code = fs.readFileSync(file, 'utf8');
  info("Read \`.saur\' file");
  let lex = new Lexer(code);
  let tree = new AST(lex.lex());
  let js = new Transpiler(tree);
  fs.writeFileSync(outFile, js.compile());
  success("Saved to " + outFile);
}

function buildLegacy(file, outFile, compiler) {
  const spinner = ora('Loading tokens|syntax-tree|transpile').start();
  spinner.color = 'blue';
  const Tokens = require('../' + compiler + '/tokens');
  const SyntaxTree = require('../' + compiler + '/syntax-tree');
  const Transpile = require('../' + compiler + '/transpile');
  spinner.stop();
  success("Using compiler v" + compiler + " at " + compilerPath);

  // Read the saurfile:
  spinner.text = 'Locating \'.saur\' file';
  spinner.start();
  if (!fs.existsSync(file)) {
    spinner.stop();
    error('\'.saur\' file \'' + file + '\' doesn\'t exist');
  }
  spinner.stop();
  success('Read ' + file);
  spinner.text = 'Reading ' + file;
  spinner.start();
  let code = fs.readFileSync(file, 'utf8');
  spinner.stop();
  success('Read ' + file);

  // Create tokens:
  spinner.text = 'Creating tokens';
  spinner.start();
  let toks = new Tokens(code);
  spinner.stop();
  success('Done: tokens');

  // Create tokens:
  spinner.text = 'Creating syntax tree';
  spinner.start();
  let tree = new SyntaxTree(toks);
  spinner.stop();
  success('Done: syntax tree');

  // Transpile:
  spinner.text = 'Transpiling';
  spinner.start();
  let js = new Transpile(tree);
  spinner.stop();
  success('Generated JavaScript code');

  // Save code:
  spinner.text = 'Saving code';
  spinner.start();
  fs.writeFileSync(outFile, js.js);
  spinner.stop();
  success('Code transpiled to ' + outFile);
}
