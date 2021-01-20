import * as https from 'https';
import * as fs from 'fs';
import Config from './config';
import app from './app';

const PORT = Config.baseconfig.port;

if (Config.baseconfig.EncryptionRequest) {
    const httpsOptions = {
        key: fs.readFileSync('../config/key.pem'),
        cert: fs.readFileSync('../config/cert.pem')
    };
    https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log('Express server listening on port ' + PORT);
    });
}else{
    app.listen(PORT, ()=>{
        console.log('🚀 Server ready at http://localhost:' + PORT);
    });
}

