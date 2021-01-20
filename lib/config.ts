import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const rootPath = path.resolve(process.cwd());
const sysConfig = `${rootPath}/config.yml`;
const sysInfo: any = yaml.load(fs.readFileSync(sysConfig, 'utf8'));
console.log('---配置信息--', sysInfo);
const Config = {
    baseconfig: sysInfo.baseconfig,
    rootPath
};

export default Config;