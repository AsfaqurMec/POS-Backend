"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kdsController = exports.KdsController = void 0;
const kds_service_1 = require("./kds.service");
const response_1 = require("../../utils/response");
class KdsController {
    async getActiveOrders(req, res, next) {
        try {
            const station = req.query.station || "ALL";
            const result = await kds_service_1.kdsService.getActiveOrders(station);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async updateOrderStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await kds_service_1.kdsService.updateOrderStatus(id, status);
            return (0, response_1.sendSuccess)(res, result, 200, "Order status updated");
        }
        catch (err) {
            next(err);
        }
    }
    streamEvents(req, res) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        kds_service_1.kdsBroadcaster.addClient(res);
        // Initial ping
        res.write(`event: CONNECTED\ndata: ${JSON.stringify({ status: "connected" })}\n\n`);
        // Keep-alive heartbeat every 25 seconds
        const interval = setInterval(() => {
            res.write(": heartbeat\n\n");
        }, 25000);
        req.on("close", () => {
            clearInterval(interval);
            kds_service_1.kdsBroadcaster.removeClient(res);
        });
    }
}
exports.KdsController = KdsController;
exports.kdsController = new KdsController();
