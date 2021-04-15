/* eslint-disable no-console */
import { Request, Response } from "express";
import axios from "axios";
import { getToken } from "../../utils";
import { slack } from "../../slack";

const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

export const notifyCancellation = async (
  req: Request,
  res: Response
): Promise<void> => {
  let inspection, inspectionId;
  try {
    inspection = JSON.parse(req.body.current);
    inspectionId = inspection._id;
    const externalId = inspection.meta?.external_id;

    if (!externalId) {
      throw new Error(`Missing required field external_id`);
    }

    const token = await getToken();
    const response = await axios.get(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${externalId}&UniqueId=${inspectionId}&Action=Cancel`,
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
      `Successfully sent cancellation notification for inspection ${inspectionId}`
    );

    res.status(200).send(response);
  } catch (error) {
    console.error(
      `Failed to send cancellation notification for inspection ${inspectionId} of carrier ${inspection.carrier._id}`,
      error
    );

    await slack.notificationsIntegrationErrors.send({
      username: `CoreLogic: Error Sending Cancellation Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Failed to send cancellation notification for inspection ${inspectionId} of carrier ${
              inspection.carrier.name
            }. \`\`\`${error.response?.data?.message ?? error.message}\`\`\``,
          },
        },
      ],
    });

    res.status(500).send(error);
  }
};
