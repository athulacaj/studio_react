import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';

const router = Router();

const tenantController = new TenantController();

router.get("/", async (req, res) => {
    console.log("hostname", req.hostname);

    try {

        const html = await tenantController.getPortfolioHtml(
            "https://pub-a7316f52d933481ead6be42bab1311b3.r2.dev/portfolios/1785054781596-index.html"
        );

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
export default router;