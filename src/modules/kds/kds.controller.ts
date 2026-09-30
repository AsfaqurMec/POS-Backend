import { Request, Response, NextFunction } from "express";
import { kdsService, kdsBroadcaster } from "./kds.service";
import { sendSuccess } from "../../utils/response";

export class KdsController {
  async getActiveOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const station = (req.query.station as string) || "ALL";
      const result = await kdsService.getActiveOrders(station);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await kdsService.updateOrderStatus(id, status);
      return sendSuccess(res, result, 200, "Order status updated");
    } catch (err) {
      next(err);
    }
  }

  streamEvents(req: Request, res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    kdsBroadcaster.addClient(res);

    // Initial ping
    res.write(`event: CONNECTED\ndata: ${JSON.stringify({ status: "connected" })}\n\n`);

    // Keep-alive heartbeat every 25 seconds
    const interval = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 25000);

    req.on("close", () => {
      clearInterval(interval);
      kdsBroadcaster.removeClient(res);
    });
  }
}

export const kdsController = new KdsController();
