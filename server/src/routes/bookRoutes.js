import { Router } from "express";
import {
  getBorrowed,
  getHistory,
  postBorrow,
  postReturn,
} from "../controllers/bookController.js";
import {
  getCatalog,
  getCatalogBookById,
  searchExternal,
  postCatalogBook,
  deleteCatalogBook,
} from "../controllers/catalogController.js";
import { authRequired } from "../middleware/auth.js";
import { adminRequired } from "../middleware/admin.js";

const router = Router();

router.get("/", getCatalog);

// KEEP BORROWING ROUTES BEFORE THE /:ID CATCH-ALL ROUTE.
router.get("/borrowed", authRequired, getBorrowed);
router.get("/history", authRequired, getHistory);
router.post("/borrow", authRequired, postBorrow);
router.post("/return", authRequired, postReturn);

router.get("/search", authRequired, adminRequired, searchExternal);
router.post("/catalog", authRequired, adminRequired, postCatalogBook);
router.delete("/:id", authRequired, adminRequired, deleteCatalogBook);

// KEEP THE PUBLIC /:ID CATCH-ALL ROUTE LAST.
router.get("/:id", getCatalogBookById);

export default router;
