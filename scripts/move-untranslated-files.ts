import fs from 'fs';
const { promisify } = require('util');
const { resolve } = require('path');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const moveTranslatedFiles = async () => {
  const i18nRoot = './i18n/';
  fs.readdirSync(i18nRoot).forEach(async (lang) => {
    const filePath = i18nRoot + lang + '/';
    const translatedFiles = await getTranslatedFiles(filePath);
    const untranslatedFiles = await getUnTranslatedFiles();
    const filesToMove = await putTogether(translatedFiles, untranslatedFiles, lang);
    moveFiles(filePath, filesToMove);
  });
};

const getFiles = async (dir: string) => {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }),
  );
  return files.reduce((a, f) => a.concat(f), []);
};

const getTranslatedFiles = async (filePath: string) => {
  const translatedRoot = 'docusaurus-plugin-content-docs/translated/';
  return await getFiles(filePath + translatedRoot);
};

const getUnTranslatedFiles = async () => {
  const docsPath = '../arbitrum-docs';
  return await getFiles(docsPath);
};

const putTogether = async (
  translateFiles: string[],
  untranslatedFiles: string[],
  language: string,
) => {
  const outputFilesMap = new Map<string, string>();
  const translatedRoot = resolve(
    './i18n/' + language + '/docusaurus-plugin-content-docs/translated',
  );
  const unTranslatedRoot = resolve('../arbitrum-docs');
  translateFiles.forEach((file) => {
    const key = file.replace(translatedRoot, '');
    outputFilesMap.set(key, file);
  });
  untranslatedFiles.forEach((file) => {
    const key = file.replace(unTranslatedRoot, '');
    if (!outputFilesMap.has(key)) {
      outputFilesMap.set(key, file);
    } else {
      console.log('find translated file: ' + file);
    }
  });
  return outputFilesMap;
};

const moveFiles = (filePath: string, files: Map<string, string>) => {
  const targetPath = filePath + 'docusaurus-plugin-content-docs/current/';
  for (let [key, value] of files) {
    try {
      fs.cpSync(value, targetPath + key);
    } catch (e) {
      console.log(key);
      throw e;
    }
  }
};

moveTranslatedFiles();
