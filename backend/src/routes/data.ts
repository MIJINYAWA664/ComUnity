import { Router } from 'express';
import { DataService } from '@/services/dataService';
import { validateRequest, schemas } from '@/middleware/validation';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();
const dataService = new DataService();

// GET /data
router.get(
  '/',
  authenticateToken,
  validateRequest({ query: schemas.pagination }),
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const result = await dataService.getData(req.user!.id, req.query);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      });
    }
  }
);

// POST /data
router.post(
  '/',
  authenticateToken,
  validateRequest({ body: schemas.createData }),
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const dataEntry = await dataService.createData(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        data: dataEntry
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      });
    }
  }
);

// GET /data/:id
router.get(
  '/:id',
  authenticateToken,
  validateRequest({ params: schemas.dataId }),
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const dataEntry = await dataService.getDataById(req.user!.id, req.params.id);

      res.json({
        success: true,
        data: dataEntry
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      });
    }
  }
);

// PUT /data/:id
router.put(
  '/:id',
  authenticateToken,
  validateRequest({ 
    params: schemas.dataId,
    body: schemas.updateData 
  }),
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const dataEntry = await dataService.updateData(
        req.user!.id,
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        data: dataEntry
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      });
    }
  }
);

// DELETE /data/:id
router.delete(
  '/:id',
  authenticateToken,
  validateRequest({ params: schemas.dataId }),
  async (req: AuthenticatedRequest, res: any) => {
    try {
      await dataService.deleteData(req.user!.id, req.params.id);

      res.json({
        success: true,
        data: { message: 'Data entry deleted successfully' }
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      });
    }
  }
);

export default router;