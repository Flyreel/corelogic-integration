import emojiRegex from "emoji-regex";
import FormData from "form-data";
import bunyan from "bunyan";
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
            Value: (message.answer?.address ?? "").replace(emojis, ""),
          });
          break;
        }
        default: {
          fieldData.push({
            Name: messageName,
            Value: (["object", "undefined"].includes(typeof message.answer)
              ? JSON.stringify(message.answer ?? "")
              : message.answer.toString()
            ).replace(emojis, ""),
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

export const createFormData = async ({
  messageType,
  fileUrl,
  inspectionId,
  externalId,
}: {
  messageType: string;
  fileUrl: string;
  inspectionId: string;
  externalId: string;
}): Promise<FormData | undefined> => {
  if (!isValidMedia(messageType, fileUrl)) {
    log.warn(
      `${fileUrl} is an invalid ${messageType} type for inspection ${inspectionId}`
    );

    return;
  }

  const form = new FormData();
  form.append("InspectionId", externalId);
  form.append("UniqueId", inspectionId);

  const { data: fileData } = await axios.get(fileUrl, {
    responseType: "stream",
  });

  form.append(getFileName(fileUrl), fileData);

  return form;
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
  videoUrl,
  inspectionId,
}: {
  coreLogicToken: string;
  videoForm: FormData;
  videoUrl: string;
  inspectionId: string;
}): Promise<void> => {
  await promiseRetry(
    (retry, number) => {
      return axios
        .post(`${corelogicApiUrl}/api/digitalhub/v1/Video/Upload`, videoForm, {
          headers: {
            Authorization: `Bearer ${coreLogicToken}`,
            "api-key": apiKey,
            "api-companyid": apiCompanyId,
            "Content-Type": "application/multipart-formdata",
            ...videoForm.getHeaders(),
          },
        })
        .catch((error) => {
          log.error(
            `Failed to send video ${videoUrl} for inspection ${inspectionId} at retry #${number}`,
            error
          );
          retry(error);
        });
    },
    { retries: 3, factor: 2, minTimeout: 1000 }
  );

  log.info(`Uploaded video ${videoUrl} for inspection ${inspectionId}`);
};

export const sendPhoto = async ({
  coreLogicToken,
  photoForm,
  photoUrl,
  inspectionId,
}: {
  coreLogicToken: string;
  photoForm: FormData;
  photoUrl: string;
  inspectionId: string;
}): Promise<void> => {
  await promiseRetry(
    (retry, number) => {
      return axios
        .post(`${corelogicApiUrl}/api/digitalhub/v1/Photo/Upload`, photoForm, {
          headers: {
            Authorization: `Bearer ${coreLogicToken}`,
            "api-key": apiKey,
            "api-companyid": apiCompanyId,
            "Content-Type": "application/multipart-formdata",
            ...photoForm.getHeaders(),
          },
        })
        .catch((error) => {
          log.error(
            `Failed to send photo ${photoUrl} for inspection ${inspectionId} at retry #${number}`,
            error
          );
          retry(error);
        });
    },
    { retries: 3, factor: 2, minTimeout: 1000 }
  );

  log.info(`Uploaded photo ${photoUrl} for inspection ${inspectionId}`);
};
