/* eslint-disable no-console */
import { Request, Response } from "express";
import axios from "axios";
import dayjs from "dayjs";
import { getToken, logEvent } from "../../utils";
import { slack } from "../../slack";

const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

export const notifyExtension = async (
  req: Request,
  res: Response
): Promise<void> => {
  let inspection,
    inspectionId,
    errorCode = 500;

  try {
    inspection = req.body.current;
    inspectionId = inspection._id;
    const expiration = inspection.expiration;
    const externalId = inspection.meta?.external_id;

    if (!externalId || !expiration) {
      const errorMessage = `Missing required field(s) ${
        !externalId && !expiration
          ? "external_id and expiration"
          : !externalId
          ? "external_id"
          : "expiration"
      }`;

      errorCode = 400;
      throw new Error(errorMessage);
    }

    const token = await getToken();
    const dueDate = formatDueDate(dayjs(expiration).toISOString());

    const response = await axios.get(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${externalId}&UniqueId=${inspectionId}&Action=Extend&DueDate=${dueDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );

    console.log(
      `Successfully sent due date extension notification for inspection ${inspectionId} with external_id ${externalId}`
    );

    await logEvent({
      inspection: inspectionId,
      event: "sent_corelogic_inspection_extension_notification",
      meta: { external_id: externalId },
    });

    res.status(200).send(response);
  } catch (error) {
    console.error(
      `Error in sending due date extension notification for inspection ${inspectionId} of carrier ${inspection.carrier._id}`,
      error
    );

    await slack.notificationsIntegrationErrors.send({
      username: `CoreLogic: Error Sending Due Date Extension Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending due date extension notification for inspection ${inspectionId} of carrier ${
              inspection.carrier.name
            }. \`\`\`${error.response?.data?.message ?? error.message}\`\`\``,
          },
        },
      ],
    });

    res.status(errorCode).send(error);
  }
};

export const formatDueDate = (date: string): string => {
  return dayjs(date).format("MM/DD/YYYY");
};
