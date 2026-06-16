import { Global, Module } from '@nestjs/common';
import { JwtServices } from './services/jwt.utls';
import { BcryptServices } from './services/bcrypt.utils';
import { MailServices } from './services/mail.utils';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
    }),
  ],
  providers: [JwtServices, BcryptServices, MailServices],
  exports: [JwtServices, BcryptServices, MailServices, JwtModule, MailerModule],
})
export class CommonModule {}
