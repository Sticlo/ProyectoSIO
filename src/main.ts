import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('🚀 Iniciando aplicación Angular...');

bootstrapApplication(App, appConfig)
  .then(() => console.log('✅ Aplicación iniciada correctamente'))
  .catch((err) => {
    console.error('❌ Error al iniciar la aplicación:', err);
  });
