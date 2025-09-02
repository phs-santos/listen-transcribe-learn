import { createPublicApiInstance, createPrivateApiInstance } from "./base";

// URLs das APIs (usando variáveis de ambiente)
const PXTALK_DEFAULT = import.meta.env.VITE_API_PXTALK_DEFAULT || "";
const PXTALK_API_DOC = import.meta.env.VITE_API_PXTALK_API_DOC || "";
const PXTALK_PAINEL_API_2 = import.meta.env.VITE_API_PXTALK_PAINEL_API_2 || "";
const PXTALK_SERVICE_LOGIN =
    import.meta.env.VITE_API_PXTALK_SERVICE_LOGIN || "";
const BACKEND_LOCAL = import.meta.env.VITE_API_BACKEND_LOCAL || "";

export const BackendLocalApi = {
    public: () => createPublicApiInstance(BACKEND_LOCAL),
    private: (token: string) => createPrivateApiInstance(BACKEND_LOCAL, token),
};

export const PxtalkApiServiceLogin = {
    public: () => createPublicApiInstance(PXTALK_SERVICE_LOGIN),
    private: (token: string) =>
        createPrivateApiInstance(PXTALK_SERVICE_LOGIN, token),
};

export const PxtalkApiDoc = {
    public: () => createPublicApiInstance(PXTALK_API_DOC),
    private: (token: string) => createPrivateApiInstance(PXTALK_API_DOC, token),
};

export const PxtalkApiDefault = {
    public: () => createPublicApiInstance(PXTALK_DEFAULT),
    private: (token: string) => createPrivateApiInstance(PXTALK_DEFAULT, token),
};

export const PxtalkApiPainel2 = {
    public: () => createPublicApiInstance(PXTALK_PAINEL_API_2),
    private: (token: string) =>
        createPrivateApiInstance(PXTALK_PAINEL_API_2, token),
};

/**
 * Tipos para uso nos hooks
 */
export type ApiServiceType =
    | "pxtalk_service_login"
    | "pxtalk_api_doc"
    | "pxtalk_api_default"
    | "pxtalk_api_painel2"
    | "backend_local";

export type ApiMode = "public" | "private_token";

/**
 * Factory para criar instâncias de API
 *
 * pxtalk_api_default: https://api.pxtalk.com.br
 * pxtalk_api_doc: https://api-doc.pxtalk.com.br/api
 * pxtalk_api_painel2: https://painel-api2.pxtalk.com.br/api
 * pxtalk_api_service_login: https://service.56k.com.br/api/loginServer
 */
export function getApiService(
    service: ApiServiceType,
    mode: ApiMode = "public",
    token?: string
) {
    switch (service) {
        case "pxtalk_api_default":
            return mode === "private_token" && token
                ? PxtalkApiDefault.private(token)
                : PxtalkApiDefault.public();

        case "pxtalk_api_doc":
            return mode === "private_token" && token
                ? PxtalkApiDoc.private(token)
                : PxtalkApiDoc.public();

        case "pxtalk_api_painel2":
            return mode === "private_token" && token
                ? PxtalkApiPainel2.private(token)
                : PxtalkApiPainel2.public();

        case "pxtalk_service_login":
            return mode === "private_token" && token
                ? PxtalkApiServiceLogin.private(token)
                : PxtalkApiServiceLogin.public();

        case "backend_local":
            return mode === "private_token" && token
                ? BackendLocalApi.private(token)
                : BackendLocalApi.public();

        default:
            throw new Error(`Serviço desconhecido: ${service}`);
    }
}
