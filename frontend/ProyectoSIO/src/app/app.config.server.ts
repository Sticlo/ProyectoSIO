import { ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';

// SSR eliminado - se reutiliza la misma config del cliente
export const config: ApplicationConfig = appConfig;

