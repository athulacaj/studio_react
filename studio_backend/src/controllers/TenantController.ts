import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "cache", "portfolios");




export class TenantController {
    async getPortfolioHtml(url: string) {
        // convert url to unique by renmoving special characters and replacing them with underscores
        const fileName = url.replace(/[^a-zA-Z0-9]/g, "_");

        const localPath = path.join(CACHE_DIR, fileName);

        try {
            return await fs.readFile(localPath, "utf8");
        } catch (e) {
            console.log("failed to read ", e);
        }


        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Portfolio not found");
        }

        const html = await response.text();

        await fs.mkdir(CACHE_DIR, { recursive: true });

        await fs.writeFile(localPath, html);

        return html;
    }

}