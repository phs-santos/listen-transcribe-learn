import { useState, useCallback, useRef } from "react";
import { getApiService } from "@/lib/api/services";
import {
    handleTicket,
    tranformeCurrentDateFormattedTicket,
} from "@/utils/tickets";
import {
    Pagination,
    TicketData,
    TicketDataAndPagination,
} from "@/types/tickets";

export function useTickets() {
    const [tickets, setTicketsState] = useState<TicketDataAndPagination>({
        data: [],
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
        },
    });

    const [isActive, setIsActive] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const cancelRequests = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    const setTickets = useCallback(
        (data: TicketData[], pagination: Pagination) => {
            setTicketsState({ data, pagination });
        },
        []
    );

    const fetchTickets = useCallback(
        async ({
            accountcode,
            condominiumId: condominium,
            start_date: startDate,
            end_date: endDate,
            page = 1,
            limit = 10,
        }: {
            accountcode: string;
            condominiumId: string;
            start_date: string;
            end_date: string;
            page?: number;
            limit?: number;
        }) => {
            cancelRequests();

            if (!isActive) {
                console.log("useTickets inativo, cancelando busca");
                return null;
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const { start_date, end_date } =
                    tranformeCurrentDateFormattedTicket(startDate, endDate);

                const query = {
                    start_date,
                    end_date,
                    condominium,
                    status: "ATENDIDA NA FILA",
                };

                const { data } = await getApiService("pxtalk_api_default").post(
                    `/custom-ticktes?accountcode=${accountcode}&page=${page}&limit=${limit}`,
                    query,
                    { signal: controller.signal }
                );

                if (!isActive) {
                    console.log("useTickets desativado após fetch");
                    return null;
                }

                const { data: respTickets, pagination: respPagination } = data;
                const parsedTickets = respTickets.map((ticket: any) =>
                    handleTicket(ticket)
                ) as TicketData[];

                const pagination = {
                    page: respPagination?.page || 1,
                    limit: respPagination?.limit || 10,
                    total: respPagination?.total_itens || 0,
                    totalPages: respPagination?.total_pages || 0,
                };

                setTickets(parsedTickets, pagination);

                abortControllerRef.current = null;

                return {
                    tickets: parsedTickets,
                    pagination,
                };
            } catch (err: any) {
                if (err.name === "AbortError") {
                    console.log("Requisição de tickets cancelada");
                    return null;
                }

                console.debug("Erro ao buscar dados:", err);

                if (isActive) {
                    setTickets([], {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 0,
                    });
                    abortControllerRef.current = null;
                }

                return null;
            }
        },
        [cancelRequests, isActive, setTickets]
    );

    const reset = useCallback(() => {
        cancelRequests();
        setIsActive(false);
        setTicketsState({
            data: [],
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            },
        });
    }, [cancelRequests]);

    return {
        tickets,
        isActive,
        fetchTickets,
        cancelRequests,
        reset,
        setTickets,
    };
}
