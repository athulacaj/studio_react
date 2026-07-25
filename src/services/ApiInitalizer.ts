import { BaseApiClient } from "./BaseApiClient";


const StudioApiClient = new BaseApiClient(import.meta.env.VITE_STUDIO_API_URL || 'http://localhost:5000/studio');

export { StudioApiClient }