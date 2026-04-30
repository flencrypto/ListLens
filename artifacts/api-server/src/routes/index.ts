import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listlensRouter from "./listlens";

const router: IRouter = Router();

router.use(healthRouter);
router.use(listlensRouter);

export default router;
