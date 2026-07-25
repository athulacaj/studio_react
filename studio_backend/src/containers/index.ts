import CloudflareRepository from "../repositories/CloudfareRepository";
import CloudflareService from "../services/CloudflareService";

import {
    cloudflareBucket,
    cloudflareS3Client,
} from "../config/cloudflare";

export const cloudflareRepository = new CloudflareRepository(
    cloudflareS3Client,
    cloudflareBucket
);

export const cloudflareService = new CloudflareService(
    cloudflareRepository
);