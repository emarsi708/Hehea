import { Router, type IRouter } from "express";
import healthRouter from "./health";
import extractRouter from "./extract";
import askRouter from "./ask";

const router: IRouter = Router();

router.use(healthRouter);
router.use(extractRouter);
router.use(askRouter);

export default router;
