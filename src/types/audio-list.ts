type Transcriber = {
    id: number;
    name: string;
    email: string;
};

export type AudioItem = {
    id: number;
    list_id: number;
    transcriber_id: number;
    duration: number;

    external_id: string;
    linkedid: string;
    title: string;
    url: string;
    status: string;
    transcript_human: string;
    transcript_ai: string;

    tags: string[];
    created_at: string;
    updated_at: string;

    transcriber: Transcriber;
};

export type GeneratePayload = {
    accountCode: string;
    date: string; // YYYY-MM-DD
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
};
