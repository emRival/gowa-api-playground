export type HttpMethod = "GET" | "POST" | "DELETE";
export type BodyType = "json" | "form-data" | "none";
export type CategoryId = "device" | "messaging" | "group";

export interface ParamDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "file" | "boolean" | "select";
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  isPathParam?: boolean;
}

export interface ApiEndpoint {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  method: HttpMethod;
  path: string;
  bodyType: BodyType;
  supportsUrlMode?: boolean;
  params: ParamDef[];
}

export interface ApiCategory {
  id: CategoryId;
  label: string;
  icon: string;
  endpoints: ApiEndpoint[];
}

const phoneParam: ParamDef = {
  name: "phone",
  label: "Phone",
  type: "text",
  required: true,
  placeholder: "628987654321@s.whatsapp.net",
  description: "Recipient WhatsApp ID",
};

const captionParam: ParamDef = {
  name: "caption",
  label: "Caption",
  type: "text",
  required: false,
  placeholder: "Optional caption",
};

const viewOnceParam: ParamDef = {
  name: "view_once",
  label: "View Once",
  type: "boolean",
  required: false,
  description: "Viewable only once",
};

const compressParam: ParamDef = {
  name: "compress",
  label: "Compress",
  type: "boolean",
  required: false,
  description: "Compress before sending",
};

const messageIdParam: ParamDef = {
  name: "message_id",
  label: "Message ID",
  type: "text",
  required: true,
  placeholder: "3EB0C127D7BACC83D6A1",
  isPathParam: true,
};

const groupIdParam: ParamDef = {
  name: "group_id",
  label: "Group ID",
  type: "text",
  required: true,
  placeholder: "120363XXX@g.us",
};

export const API_CATEGORIES: ApiCategory[] = [
  {
    id: "device",
    label: "Device",
    icon: "Smartphone",
    endpoints: [
      {
        id: "login-qr",
        category: "device",
        name: "Login with QR",
        description: "Initiate QR code based login flow",
        method: "GET",
        path: "/app/login",
        bodyType: "none",
        params: [],
      },
      {
        id: "login-code",
        category: "device",
        name: "Login with Pair Code",
        description: "Generate pairing code for multi-device login",
        method: "GET",
        path: "/app/login-with-code",
        bodyType: "none",
        params: [
          {
            name: "phone",
            label: "Phone Number",
            type: "text",
            required: true,
            placeholder: "628987654321",
            description: "Phone number for pairing code",
          },
        ],
      },
      {
        id: "logout",
        category: "device",
        name: "Logout",
        description: "Sign out the current WhatsApp session",
        method: "GET",
        path: "/app/logout",
        bodyType: "none",
        params: [],
      },
      {
        id: "reconnect",
        category: "device",
        name: "Reconnect",
        description: "Reconnect to WhatsApp using stored session",
        method: "GET",
        path: "/app/reconnect",
        bodyType: "none",
        params: [],
      },
      {
        id: "devices",
        category: "device",
        name: "List Devices",
        description: "Get all registered devices",
        method: "GET",
        path: "/app/devices",
        bodyType: "none",
        params: [],
      },
      {
        id: "status",
        category: "device",
        name: "Connection Status",
        description: "Check connection status of the device",
        method: "GET",
        path: "/app/status",
        bodyType: "none",
        params: [],
      },
    ],
  },
  {
    id: "messaging",
    label: "Messaging",
    icon: "MessageSquare",
    endpoints: [
      {
        id: "send-message",
        category: "messaging",
        name: "Send Message",
        description: "Send a text message to a recipient",
        method: "POST",
        path: "/send/message",
        bodyType: "json",
        params: [
          phoneParam,
          {
            name: "message",
            label: "Message",
            type: "textarea",
            required: true,
            placeholder: "Hello from GoWA!",
          },
          {
            name: "reply_message_id",
            label: "Reply Message ID",
            type: "text",
            required: false,
            placeholder: "Optional message ID to reply to",
          },
        ],
      },
      {
        id: "send-image",
        category: "messaging",
        name: "Send Image",
        description: "Send an image via URL or file upload",
        method: "POST",
        path: "/send/image",
        bodyType: "form-data",
        supportsUrlMode: true,
        params: [
          phoneParam,
          {
            name: "image_url",
            label: "Image URL",
            type: "text",
            required: false,
            placeholder: "https://example.com/photo.jpg",
            description: "URL mode only",
          },
          {
            name: "image",
            label: "Image File",
            type: "file",
            required: false,
            placeholder: "/path/to/photo.jpg",
            description: "File upload mode only",
          },
          captionParam,
          compressParam,
          viewOnceParam,
        ],
      },
      {
        id: "send-video",
        category: "messaging",
        name: "Send Video",
        description: "Send a video via URL or file upload",
        method: "POST",
        path: "/send/video",
        bodyType: "form-data",
        supportsUrlMode: true,
        params: [
          phoneParam,
          {
            name: "video_url",
            label: "Video URL",
            type: "text",
            required: false,
            placeholder: "https://example.com/video.mp4",
            description: "URL mode only",
          },
          {
            name: "video",
            label: "Video File",
            type: "file",
            required: false,
            placeholder: "/path/to/video.mp4",
            description: "File upload mode only",
          },
          captionParam,
          compressParam,
          viewOnceParam,
        ],
      },
      {
        id: "send-audio",
        category: "messaging",
        name: "Send Audio",
        description: "Send an audio message via file upload",
        method: "POST",
        path: "/send/audio",
        bodyType: "form-data",
        params: [
          phoneParam,
          {
            name: "audio",
            label: "Audio File",
            type: "file",
            required: true,
            placeholder: "/path/to/voice.ogg",
          },
        ],
      },
      {
        id: "send-file",
        category: "messaging",
        name: "Send File",
        description: "Send a document/file via file upload",
        method: "POST",
        path: "/send/file",
        bodyType: "form-data",
        params: [
          phoneParam,
          {
            name: "file",
            label: "File",
            type: "file",
            required: true,
            placeholder: "/path/to/report.pdf",
          },
          captionParam,
        ],
      },
      {
        id: "send-sticker",
        category: "messaging",
        name: "Send Sticker",
        description: "Send a sticker (auto-converts to WebP)",
        method: "POST",
        path: "/send/sticker",
        bodyType: "form-data",
        supportsUrlMode: true,
        params: [
          phoneParam,
          {
            name: "sticker_url",
            label: "Sticker URL",
            type: "text",
            required: false,
            placeholder: "https://example.com/sticker.webp",
            description: "URL mode only",
          },
          {
            name: "sticker",
            label: "Sticker File",
            type: "file",
            required: false,
            placeholder: "/path/to/sticker.webp",
            description: "File upload mode only",
          },
        ],
      },
      {
        id: "send-contact",
        category: "messaging",
        name: "Send Contact",
        description: "Send a contact card",
        method: "POST",
        path: "/send/contact",
        bodyType: "json",
        params: [
          phoneParam,
          {
            name: "contact_name",
            label: "Contact Name",
            type: "text",
            required: true,
            placeholder: "John Doe",
          },
          {
            name: "contact_phone",
            label: "Contact Phone",
            type: "text",
            required: true,
            placeholder: "628111222333",
          },
        ],
      },
      {
        id: "send-link",
        category: "messaging",
        name: "Send Link",
        description: "Send a link with a custom caption",
        method: "POST",
        path: "/send/link",
        bodyType: "json",
        params: [
          phoneParam,
          {
            name: "link",
            label: "URL",
            type: "text",
            required: true,
            placeholder: "https://example.com",
          },
          captionParam,
        ],
      },
      {
        id: "send-location",
        category: "messaging",
        name: "Send Location",
        description: "Send GPS coordinates",
        method: "POST",
        path: "/send/location",
        bodyType: "json",
        params: [
          phoneParam,
          {
            name: "latitude",
            label: "Latitude",
            type: "text",
            required: true,
            placeholder: "-6.2088",
          },
          {
            name: "longitude",
            label: "Longitude",
            type: "text",
            required: true,
            placeholder: "106.8456",
          },
        ],
      },
      {
        id: "send-poll",
        category: "messaging",
        name: "Send Poll",
        description: "Send a poll with multiple options",
        method: "POST",
        path: "/send/poll",
        bodyType: "json",
        params: [
          phoneParam,
          {
            name: "question",
            label: "Question",
            type: "text",
            required: true,
            placeholder: "What do you prefer?",
          },
          {
            name: "options",
            label: "Options (comma-separated)",
            type: "text",
            required: true,
            placeholder: "Option A, Option B, Option C",
          },
          {
            name: "max_answer",
            label: "Max Answers",
            type: "text",
            required: false,
            placeholder: "1",
          },
        ],
      },
      {
        id: "send-presence",
        category: "messaging",
        name: "Send Presence",
        description: "Set online/offline presence",
        method: "POST",
        path: "/send/presence",
        bodyType: "json",
        params: [
          {
            name: "type",
            label: "Presence Type",
            type: "select",
            required: true,
            options: [
              { label: "Available", value: "available" },
              { label: "Unavailable", value: "unavailable" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "group",
    label: "Group",
    icon: "Users",
    endpoints: [
      {
        id: "group-create",
        category: "group",
        name: "Create Group",
        description: "Create a new WhatsApp group",
        method: "POST",
        path: "/group",
        bodyType: "json",
        params: [
          {
            name: "title",
            label: "Group Name",
            type: "text",
            required: true,
            placeholder: "My Group",
          },
          {
            name: "participants",
            label: "Participants (comma-separated)",
            type: "text",
            required: false,
            placeholder: "628xxx@s.whatsapp.net, 628yyy@s.whatsapp.net",
          },
        ],
      },
      {
        id: "group-info",
        category: "group",
        name: "Group Info",
        description: "Get detailed group information",
        method: "GET",
        path: "/group/info",
        bodyType: "none",
        params: [groupIdParam],
      },
      {
        id: "group-info-from-link",
        category: "group",
        name: "Group Info from Link",
        description: "Get group info from an invite link",
        method: "GET",
        path: "/group/info-from-link",
        bodyType: "none",
        params: [
          {
            name: "link",
            label: "Invite Link",
            type: "text",
            required: true,
            placeholder: "https://chat.whatsapp.com/XXXX",
          },
        ],
      },
      {
        id: "group-join",
        category: "group",
        name: "Join Group with Link",
        description: "Join a group using an invite link",
        method: "POST",
        path: "/group/join-with-link",
        bodyType: "json",
        params: [
          {
            name: "link",
            label: "Invite Link",
            type: "text",
            required: true,
            placeholder: "https://chat.whatsapp.com/XXXX",
          },
        ],
      },
      {
        id: "group-leave",
        category: "group",
        name: "Leave Group",
        description: "Leave a group",
        method: "POST",
        path: "/group/leave",
        bodyType: "json",
        params: [groupIdParam],
      },
      {
        id: "group-participants",
        category: "group",
        name: "List Participants",
        description: "List all participants in a group",
        method: "GET",
        path: "/group/participants",
        bodyType: "none",
        params: [groupIdParam],
      },
      {
        id: "group-add-participants",
        category: "group",
        name: "Add Participants",
        description: "Add participants to a group",
        method: "POST",
        path: "/group/participants",
        bodyType: "json",
        params: [
          groupIdParam,
          {
            name: "participants",
            label: "Participants (comma-separated)",
            type: "text",
            required: true,
            placeholder: "628xxx@s.whatsapp.net, 628yyy@s.whatsapp.net",
          },
        ],
      },
      {
        id: "group-remove-participants",
        category: "group",
        name: "Remove Participant",
        description: "Remove a participant from a group",
        method: "POST",
        path: "/group/participants/remove",
        bodyType: "json",
        params: [
          groupIdParam,
          {
            name: "participants",
            label: "Participants (comma-separated)",
            type: "text",
            required: true,
            placeholder: "628xxx@s.whatsapp.net",
          },
        ],
      },
      {
        id: "group-set-name",
        category: "group",
        name: "Set Group Name",
        description: "Update group display name",
        method: "POST",
        path: "/group/name",
        bodyType: "json",
        params: [
          groupIdParam,
          {
            name: "name",
            label: "New Name",
            type: "text",
            required: true,
            placeholder: "New Group Name",
          },
        ],
      },
      {
        id: "group-set-topic",
        category: "group",
        name: "Set Group Topic",
        description: "Update group description/topic",
        method: "POST",
        path: "/group/topic",
        bodyType: "json",
        params: [
          groupIdParam,
          {
            name: "topic",
            label: "Topic",
            type: "textarea",
            required: true,
            placeholder: "Group description here...",
          },
        ],
      },
      {
        id: "group-invite-link",
        category: "group",
        name: "Get Invite Link",
        description: "Get or reset group invite link",
        method: "GET",
        path: "/group/invite-link",
        bodyType: "none",
        params: [groupIdParam],
      },
    ],
  },
];
