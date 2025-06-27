import { InjectionToken } from '@angular/core';
import { GenerativeModel } from 'firebase/ai';

export const GEMINI_MODEL = new InjectionToken<GenerativeModel>('gemini_model');
