import { TemplateDelegate } from 'handlebars';
import {
  IRestPasswordTemplatedData,
  ITemplatedData,
} from './template-data.interface';

export interface ITemplates {
  confirmation: TemplateDelegate<ITemplatedData>;
  resetPassword: TemplateDelegate<IRestPasswordTemplatedData>;
}
