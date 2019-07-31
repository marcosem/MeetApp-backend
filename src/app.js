// By using the module "sucrase" you can use the syntaxe "import" instead of variable
// declaration for importing modules
import 'dotenv/config'; // load all environment variables to process.env
import express from 'express';
import path from 'path';
import cors from 'cors';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import './database';
import sentryConfig from './config/sentry';
import routes from './routes';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandle();
  }

  middlewares() {
    // The request handler must be the first middleware on the app
    this.server.use(Sentry.Handlers.requestHandler());

    // This allow other addresses to access this API, in this case it is all
    // If you want to have a specific address allowed to access, you need to do something like:
    // this.server.use(cors({ origin: 'https://rocketseat.com.br' }));

    this.server.use(cors());

    // Make the application eligible to receibe requires in JSon format.
    this.server.use(express.json());
    // Define the folder for files, it will be useful on frontend
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);

    // The error handler must be before any other error middleware
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandle() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

// By using the module "sucrase" you can use the syntaxe "export default" instead of module.exports
// module.exports = new App().server;
export default new App().server;
