// const app = require('./app');
// By using the module "sucrase" you can use the syntaxe "import" instead of variable
// declaration for importing modules
import app from './app';

// The server is splitted from app for testing purposes
app.listen(3333);
