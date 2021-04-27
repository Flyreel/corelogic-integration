import emojiRegex from "emoji-regex";

const emojis = emojiRegex();
const punctuation = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
const spaces = /\s+/g;

export const transformFormData = (inspection: any): any => {
  const conversation = inspection.conversation;
  const fieldData = [] as any;
  if (!conversation) throw new Error(`Missing required conversation`);

  const messages = [] as any;

  conversation.modules?.forEach((module: any) => {
    module.messages.forEach((message: any) => {
      messages.push(message);
    });
  });

  messages.forEach((message: any) => {
    if (
      message.show_in_dashboard &&
      message.completed &&
      message.type !== "photo" &&
      message.type !== "video"
    ) {
      fieldData.push({
        Name: message.name.replace(punctuation, "").replace(spaces, ""),
        Value: message.answer.replace(emojis, ""),
      });
    }
  });

  const formUpload = {
    InspectionId: inspection._id,
    UniqueId: inspection.meta?.external_id,
    Field: fieldData,
  };

  return formUpload;
};

export const transformPhotos = (inspection: any): any => {
  const conversation = inspection.conversation;
  const photos = inspection.meta?.exportedPhotos ?? [];

  if (!conversation) throw new Error(`Missing required conversation`);

  const messages = [] as any;

  conversation.modules?.forEach((module: any) => {
    module.messages.forEach((message: any) => {
      messages.push(message);
    });
  });

  messages.forEach((message: any) => {
    const messageName = message.name
      .replace(punctuation, "")
      .replace(spaces, "");
    if (
      message.show_in_dashboard &&
      message.completed &&
      message.type === "photo" &&
      !photos[messageName]
    ) {
      photos[messageName] = [];
      photos[messageName].push(message.answer);
    } else if (
      message.show_in_dashboard &&
      message.completed &&
      message.type === "video" &&
      !photos[messageName]
    ) {
      photos[messageName] = [];
      message.detections.forEach((detection: any) => {
        photos[messageName].push(detection.thumb_url);
      });
    }
  });

  inspection.meta.exportedPhotos = photos;
  return photos;
};

export const transformVideos = (inspection: any): any => {
  const conversation = inspection.conversation;
  const videos = inspection.meta?.exportedVideos ?? [];

  if (!conversation) throw new Error(`Missing required conversation`);

  const messages = [] as any;

  conversation.modules?.forEach((module: any) => {
    module.messages.forEach((message: any) => {
      messages.push(message);
    });
  });

  messages.forEach((message: any) => {
    if (
      message.show_in_dashboard &&
      message.completed &&
      message.type === "video" &&
      !videos[message.name]
    ) {
      videos[message.name] = message.answer;
    }
  });

  inspection.meta.exportedVideos = videos;
  return videos;
};
