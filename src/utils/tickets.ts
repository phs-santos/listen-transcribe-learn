import { CallTicket, TicketData } from "@/types/tickets";

export function tranformeCurrentDateFormattedTicket(
    start_date: string,
    end_date: string
) {
    // transformar 2025-08-25T00:00:00 em 2025-08-25 00:00:00
    const formattedStartDate = start_date.replace("T", " ");
    const formattedEndDate = end_date.replace("T", " ");
    return { start_date: formattedStartDate, end_date: formattedEndDate };
}

export function handleTicket(ticket: CallTicket): TicketData {
    console.log(ticket);

    const checkHasAudio = (url: string | null) => {
        if (url && url.startsWith("https")) {
            return true;
        }
        return false;
    };

    return {
        id: ticket.banco_id,
        linkedid: ticket.linkedid,
        duration: ticket.TMA,
        hasAudio: checkHasAudio(ticket.audiorecord),
        audiorecord: checkHasAudio(ticket.audiorecord)
            ? ticket.audiorecord
            : null,
    };
}
