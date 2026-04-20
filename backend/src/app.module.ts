import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { ResponsesModule } from './modules/responses/responses.module';
import { LeadsModule } from './modules/leads/leads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DatasetsModule } from './modules/datasets/datasets.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ExportsModule } from './modules/exports/exports.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RespondentsModule } from './modules/respondents/respondents.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { AdminModule } from './modules/admin/admin.module';
import { ApiAccessRequestsModule } from './modules/api-access-requests/api-access-requests.module';
import { MailerModule } from './modules/mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PlansModule,
    SubscriptionsModule,
    SurveysModule,
    ResponsesModule,
    LeadsModule,
    NotificationsModule,
    AuditLogsModule,
    DatasetsModule,
    DashboardModule,
    AnalysisModule,
    ExportsModule,
    PaymentsModule,
    RespondentsModule,
    InvitationsModule,
    AdminModule,
    ApiAccessRequestsModule,
    MailerModule,
  ],
})
export class AppModule { }
