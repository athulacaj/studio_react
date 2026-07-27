import { BaseApiClient } from "./BaseApiClient";


const StudioApiClient = new BaseApiClient(import.meta.env.VITE_API_URL);

export { StudioApiClient }