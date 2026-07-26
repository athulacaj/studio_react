import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';

const baseRoutes = Router();
const tenantRoutes = Router();

const tenantController = new TenantController();

baseRoutes.get("/", async (req, res) => {
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

/**
 * @swagger
 * /tenant:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerUserId
 *               - name
 *               - slug
 *             properties:
 *               ownerUserId:
 *                 type: integer
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               customDomain:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created
 *       500:
 *         description: Internal Server Error
 */
tenantRoutes.post("/", (req, res) => tenantController.create(req, res));

/**
 * @swagger
 * /tenant/{id}:
 *   put:
 *     summary: Update an existing tenant
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ownerUserId:
 *                 type: integer
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               customDomain:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Internal Server Error
 */
tenantRoutes.put("/:id", (req, res) => tenantController.update(req, res));

/**
 * @swagger
 * /tenant/{id}:
 *   get:
 *     summary: Get a tenant by ID
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Internal Server Error
 */
tenantRoutes.get("/:id", (req, res) => tenantController.get(req, res));

export { baseRoutes, tenantRoutes };