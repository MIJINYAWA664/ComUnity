import { Router } from 'express';
import { UserService } from '@/services/userService';
import { validateRequest, schemas } from '@/middleware/validation';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();
const userService = new UserService();

// GET /users/profile
router.get(
  '/profile',
  authenticateToken,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const profile = await userService.getUserProfile(req.user!.id);

      res.json({
        success: true,
        data: profile
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

// PUT /users/profile
router.put(
  '/profile',
  authenticateToken,
  validateRequest({ body: schemas.updateProfile }),
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const updatedProfile = await userService.updateUserProfile(
        req.user!.id,
        req.body
      );

      res.json({
        success: true,
        data: updatedProfile
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

// GET /users/:id
router.get(
  '/:id',
  authenticateToken,
  validateRequest({ params: schemas.userId }),
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const user = await userService.getUserById(req.user!.id, req.params.id);

      res.json({
        success: true,
        data: user
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

// GET /users/search?q=query
router.get(
  '/search',
  authenticateToken,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Search query must be at least 2 characters',
            code: 'INVALID_SEARCH_QUERY'
          }
        });
      }

      const users = await userService.searchUsers(query.trim(), limit);

      res.json({
        success: true,
        data: users
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