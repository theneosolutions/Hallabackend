import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config';
import { validationSchema } from './config/config.schema';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from './mailer/mailer.module';
import { StripeModule } from './stripe/stripe.module';
import { ContactsModule } from './contacts/contacts.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { EventsModule } from './events/events.module';
import { CardModule } from './cards/card.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [/*...*/],
        migrationsTableName: "custom_migration_table",
        synchronize: false
      })
    }),
    AuthModule,
    CommonModule,
    UsersModule,
    JwtModule,
    MailerModule,
    StripeModule,
    ContactsModule,
    WhatsappModule,
    EventsModule,
    CardModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }
