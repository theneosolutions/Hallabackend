import { TemplateDelegate } from 'handlebars';
import { ITemplatedData } from './template-data.interface';

export interface ITemplates {
    invite: TemplateDelegate<ITemplatedData>;
}