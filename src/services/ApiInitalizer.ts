import { BaseApiClient } from "./BaseApiClient";


const StudioApiClient = new BaseApiClient(import.meta.env.VITE_API_URL);
const AssetsApiClient = new BaseApiClient(import.meta.env.VITE_ASSETS_API_URL, {
    withCredentials: false,
    headers: {}
});

export { StudioApiClient, AssetsApiClient }