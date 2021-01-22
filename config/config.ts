import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const rootPath = path.resolve(process.cwd());
const sysConfig = `${rootPath}/config.yml`;
const sysInfo: any = yaml.load(fs.readFileSync(sysConfig, 'utf8'));
const Config = {
    baseconfig: sysInfo.baseconfig,
    rootPath,
    version: '1.0',
    host: process.env.APP_HOST || '127.0.0.1',
    environment: process.env.NODE_ENV || 'development',
    logging: {
        dir: process.env.LOGGING_DIR || 'logs',
        level: process.env.LOGGING_LEVEL || 'debug'
    },
    auth: {
        secretKey: process.env.SECRET_KEY || '4C31F7EFD6857D91E729165510520424'
    }
};

export default Config;