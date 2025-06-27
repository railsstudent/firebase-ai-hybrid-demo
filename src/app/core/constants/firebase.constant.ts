import { InjectionToken } from '@angular/core';
import { GenerativeModel } from 'firebase/ai';

export const GENERATIVE_MODEL = new InjectionToken<GenerativeModel>('imagen_model');
