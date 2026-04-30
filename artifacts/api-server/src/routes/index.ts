import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import listlensRouter from "./listlens";
import ebayRouter from "./ebay";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(listlensRouter);
router.use(ebayRouter);

export default router;
