/* eslint-disable no-console */
import emojiRegex from "emoji-regex";
import FormData from "form-data";
import bunyan from "bunyan";
import fs from "fs";
import path from "path";
import { URL } from "url";
import pascalcase from "pascalcase";
import promiseRetry from "promise-retry";
import axios from "axios";

export const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
export const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
export const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;
const log = bunyan.createLogger({ name: "export-inspection" });

const emojis = emojiRegex();

export const transformInspectionData = (inspection: any): any => {
  const conversation = inspection.conversation;
  const fieldData: any[] = [];
  const photoMessages = [] as any[];
  const videoMessages = [] as any[];

  if (!conversation) throw new Error(`Missing required conversation`);

  conversation.modules?.forEach((module: any) => {
    module.messages.forEach((message: any) => {
      if (!message.completed) {
        return;
      }

      const messageName = `${pascalcase(module.name)}${
        message.iteration_id ?? "0"
      }_${pascalcase(message.name)}`;

      switch (message.type) {
        case "photo": {
          photoMessages.push(message);
          break;
        }
        case "video": {
          videoMessages.push(message);
          break;
        }
        case "location": {
          fieldData.push({
            Name: messageName,
            Value: JSON.stringify(message.answer?.address ?? "").replace(
              emojis,
              ""
            ),
          });
          break;
        }
        default: {
          fieldData.push({
            Name: messageName,
            Value: JSON.stringify(message.answer ?? "").replace(emojis, ""),
          });
        }
      }
    });
  });

  const formUpload = {
    InspectionId: inspection.meta?.external_id,
    UniqueId: inspection._id,
    Field: fieldData,
  };

  return { formUpload, photoMessages, videoMessages };
};

export const createFormData = ({
  messageType,
  filePath,
  inspectionId,
  externalId,
}: {
  messageType: string;
  filePath: string;
  inspectionId: string;
  externalId: string;
}): FormData | undefined => {
  if (!isValidMedia(messageType, filePath)) {
    log.warn(
      `${filePath} is an invalid ${messageType} type for inspection ${inspectionId}`
    );

    return;
  }

  const form = new FormData();
  form.append("InspectionId", externalId);
  form.append("UniqueId", inspectionId);
  form.append(getFileName(filePath), fs.createReadStream(filePath));

  return form;
};

const getContentLength = async (fileUrl: string) => {
  const { headers } = await axios.head(fileUrl);
  return headers["content-length"];
};

const getFileExtension = (filePath: string): string => {
  try {
    return path.extname(new URL(filePath).pathname);
  } catch (err) {
    return "";
  }
};

const getFileName = (filePath: string): string => {
  return path.basename(new URL(filePath).pathname);
};

const isPhoto = (filePath: string): boolean => {
  const allowedPhotoExtensions = new Set([".jpg", ".jpeg"]);

  return allowedPhotoExtensions.has(getFileExtension(filePath).toLowerCase());
};

const isVideo = (filePath: string): boolean => {
  const allowedVideoExtensions = new Set([".mov", ".mp4"]);

  return allowedVideoExtensions.has(getFileExtension(filePath).toLowerCase());
};

const isValidMedia = (type: string, filePath: string): boolean =>
  !!filePath &&
  ((type === "photo" && isPhoto(filePath)) ||
    (type === "video" && isVideo(filePath)));

export const sendVideo = async ({
  coreLogicToken,
  videoForm,
  videoPath,
  inspectionId,
}: {
  coreLogicToken: string;
  videoForm: FormData;
  videoPath: string;
  inspectionId: string;
}): Promise<void> => {
  const contentLength = await getContentLength(videoPath);

  const { data } = await promiseRetry(
    (retry, number) => {
      return axios
        .post(`${corelogicApiUrl}/api/digitalhub/v1/Video/Upload`, videoForm, {
          headers: {
            Authorization: `Bearer ${coreLogicToken}`,
            "api-key": apiKey,
            "api-companyid": apiCompanyId,
            ...videoForm.getHeaders(),
            "Content-Length": contentLength,
          },
        })
        .catch((error) => {
          log.error(
            `Failed to send video ${videoPath} for inspection ${inspectionId} at retry #${number}`,
            error
          );
          retry(error);
        });
    },
    { retries: 3, factor: 2, minTimeout: 1000 }
  );

  log.info(
    `Upload video ${videoPath} response for inspection ${inspectionId}: ${JSON.stringify(
      data,
      null,
      2
    )}`
  );
};

export const sendPhoto = async ({
  coreLogicToken,
  photoForm,
  photoPath,
  inspectionId,
}: {
  coreLogicToken: string;
  photoForm: FormData;
  photoPath: string;
  inspectionId: string;
}): Promise<void> => {
  const contentLength = await getContentLength(photoPath);

  const { data } = await promiseRetry(
    (retry, number) => {
      return axios
        .post(`${corelogicApiUrl}/api/digitalhub/v1/Photo/Upload`, photoForm, {
          headers: {
            Authorization: `Bearer ${coreLogicToken}`,
            "api-key": apiKey,
            "api-companyid": apiCompanyId,
            ...photoForm.getHeaders(),
            "Content-Length": contentLength,
          },
        })
        .catch((error) => {
          log.error(
            `Failed to send photo ${photoPath} for inspection ${inspectionId} at retry #${number}`,
            error
          );
          retry(error);
        });
    },
    { retries: 3, factor: 2, minTimeout: 1000 }
  );

  log.info(
    `Upload photo ${photoPath} response for inspection ${inspectionId}: ${JSON.stringify(
      data,
      null,
      2
    )}`
  );
};
