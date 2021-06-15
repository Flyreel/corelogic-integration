/* eslint-disable no-console */
import { Request, Response } from "express";
import axios from "axios";
import { slack } from "../../slack";
import { getToken, logEvent } from "../../utils";
import {
  transformInspectionData,
  createFormData,
  sendPhoto,
  sendVideo,
} from "./exportHelpers";

export const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
export const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
export const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;
const flyreelApiUrl = process.env.FLYREEL_API_BASE_URL as string;
const flyreelToken = process.env.FLYREEL_API_TOKEN as string;

export const exportInspection = async (
  req: Request,
  res: Response
): Promise<void> => {
  let inspection, inspectionId;

  try {
    inspection = req.body.current;
    inspectionId = inspection._id;
    const externalId = inspection.meta?.external_id as string;

    if (!externalId) {
      throw new Error(`Missing required field external_id`);
    }

    const fullInspection = await axios.get(
      `${flyreelApiUrl}/v2/inspections/${inspectionId}`,
      {
        headers: {
          Authorization: `Bearer ${flyreelToken}`,
        },
      }
    );

    const coreLogicToken = await getToken();
    const {
      formUpload,
      photoMessages,
      videoMessages,
    } = transformInspectionData(fullInspection);

    await axios.post(
      `${corelogicApiUrl}/api/digitalhub/v1/Form/Upload`,
      formUpload,
      {
        headers: {
          Authorization: `Bearer ${coreLogicToken}`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );

    console.log(
      `Successfully sent form data to CoreLogic for inspection ${inspectionId}`
    );

    for (const photoMessage of photoMessages) {
      const photoForm = createFormData({
        inspectionId,
        externalId,
        filePath: photoMessage.answer,
        messageType: photoMessage.type,
      });

      await sendPhoto({
        coreLogicToken,
        photoForm,
        photoPath: photoMessage.answer,
        inspectionId,
      });
    }

    console.log(
      `Successfully sent photo data to CoreLogic for inspection ${inspectionId}`
    );

    for (const videoMessage of videoMessages) {
      const videoForm = createFormData({
        inspectionId,
        externalId,
        filePath: videoMessage.answer,
        messageType: videoMessage.type,
      });

      await sendVideo({
        coreLogicToken,
        videoForm,
        videoPath: videoMessage.answer,
        inspectionId,
      });

      if (videoMessage.detections?.length) {
        for (const detection of videoMessage.detections) {
          await sendPhoto({
            coreLogicToken,
            photoForm: createFormData({
              inspectionId,
              externalId,
              filePath: detection.thumb_url,
              messageType: "photo",
            }),
            photoPath: detection.thumb_url,
            inspectionId,
          });
        }
      }
    }

    console.log(
      `Successfully sent video data to CoreLogic for inspection ${inspectionId}`
    );

    const response = await axios.get(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${externalId}&UniqueId=${inspectionId}&Action=Complete`,
      {
        headers: {
          Authorization: `Bearer ${coreLogicToken}`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );

    console.log(
      `Successfully updated CoreLogic inspection status to Complete for ${inspectionId}: ${JSON.stringify(
        response.data
      )}`
    );

    await logEvent({
      inspection: inspectionId,
      event: "inspection_data_sent_to_corelogic",
      meta: { external_id: externalId },
    });

    res.status(200).send(response.data);
  } catch (error) {
    console.error(
      `Error in sending data to CoreLogic for inspection ${inspectionId}`,
      error
    );

    await slack.notificationsIntegrationErrors.send({
      username: `CoreLogic: Error exporting inspection`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error to export inspection ${inspectionId} to CoreLogic. \`\`\`${
              error.response?.data?.message ??
              error.response?.data?.Message ??
              error.message
            }\`\`\``,
          },
        },
      ],
    });

    res.status(500).send(error);
  }
};
