import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { join } from 'path';
import { IEmailConfig } from '../config/interfaces/email-config.interface';
import { IUser } from '../users/interfaces/user.interface';
import { IRestPasswordTemplatedData, ITemplatedData } from './interfaces/template-data.interface';
import { ITemplates } from './interfaces/templates.interface';

@Injectable()
export class MailerService {
    private readonly loggerService: LoggerService;
    private readonly transport: Transporter<SMTPTransport.SentMessageInfo>;
    private readonly email: string;
    private readonly domain: string;
    private readonly templates: ITemplates;

    constructor(private readonly configService: ConfigService) {
        const emailConfig = this.configService.get<IEmailConfig>('emailService');
        this.transport = createTransport(emailConfig);
        this.email = `"My App" <${emailConfig.email}>`;
        this.domain = this.configService.get<string>('domain');
        this.loggerService = new Logger(MailerService.name);
        this.templates = {
            confirmation: MailerService.parseTemplate('confirmation.hbs'),
            resetPassword: MailerService.parseTemplate('reset-password.hbs'),
        };
    }

    private static parseTemplate(
        templateName: string,
    ): Handlebars.TemplateDelegate<ITemplatedData | IRestPasswordTemplatedData> {
        const templateText = readFileSync(
            join(__dirname, '..','mailer', 'templates', templateName),
            'utf-8',
        );
        return Handlebars.compile<ITemplatedData>(templateText, { strict: true });
    }

    public sendConfirmationEmail(user: IUser, token: string): void {
        const { email, firstName, lastName } = user;
        const name = `${firstName} ${lastName}`;
        const subject = 'Confirm your email';
        const html = this.templates.confirmation({
            name,
            link: `https://${this.domain}/api/auth/confirm-email/${token}`,
        });
        this.sendEmail(email, subject, html, 'A new confirmation email was sent.');
    }

    public sendResetPasswordEmail(user: IUser, otp: number): void {
        const { email, firstName, lastName } = user;
        const name = `${firstName} ${lastName}`;
        const subject = 'Reset your password';
        const html = this.templates.resetPassword({
            name,
            otp: otp,
        });
        this.sendEmail(
            email,
            subject,
            html,
            'A new reset password email was sent.',
        );
    }

    public sendEmail(
        to: string,
        subject: string,
        html: string,
        log?: string,
    ): void {
        this.transport
            .sendMail({
                from: this.email,
                to,
                subject,
                html,
            })
            .then(() => this.loggerService.log(log ?? 'A new email was sent.'))
            .catch((error) => this.loggerService.error(error));
    }
}