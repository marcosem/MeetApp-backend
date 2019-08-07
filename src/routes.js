// const { Router } = require('express');
// By using the module "sucrase" you can use the syntaxe "import" instead of variable
// declaration for importing modules
import { Router } from 'express';
import multer from 'multer'; //
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';
import OwnerController from './app/controllers/OwnerController';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store); // Create user account
routes.post('/sessions', SessionController.store); // Login

routes.use(authMiddleware);
routes.put('/users', UserController.update); // Update user account
routes.post('/files', upload.single('file'), FileController.store);
routes.post('/meetups', MeetupController.store);
routes.get('/meetups', MeetupController.index);
routes.get('/meetups/:id', MeetupController.index);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);
routes.post('/meetups/:id/subscribe', SubscriptionController.store);
routes.get('/subscriptions', SubscriptionController.index);

routes.get('/mymeetups', OwnerController.index);
routes.get('/mymeetups/:id', OwnerController.index);

// routes.post('/subscription', SubscriptionController.store);

// By using the module "sucrase" you can use the syntaxe "export default" instead of module.exports
// module.exports = routes;
export default routes;
