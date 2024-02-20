import cors from 'cors';

const localhostCorsOptions = {
    origin: 'http://localhost:4001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };

export default cors();