import { IncomingWebhook } from "@slack/webhook";

export const slack = {
  notificationsIntegrationErrors: new IncomingWebhook(
    process.env.SLACK_INTEGRATION_ERRORS as string
  ),
};
