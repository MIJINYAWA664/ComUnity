import { Router } from 'express';
import { AuthService } from '@/services/authService';
import { validateRequest, schemas } from '@/middleware/validation';
import { authRateLimitMiddleware } from '@/middleware/rateLimiter';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';
import { ApiResponse } from '@/types/api';
import { SignupRequest, LoginRequest } from '@/types/auth';

const router = Router();
const authService = new AuthService();

// POST /auth/signup
router.post(
  '/signup',
  authRateLimitMiddleware,
  validateRequest({ body: schemas.signup }),
  async (req, res: any) => {
    try {
      const signupData: SignupRequest = req.body;
      const result = await authService.signup(signupData);

      res.status(201).json({
        success: true,
        data: result
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

// POST /auth/login
router.post(
  '/login',
  authRateLimitMiddleware,
  validateRequest({ body: schemas.login }),
  async (req, res: any) => {
    try {
      const loginData: LoginRequest = req.body;
      const result = await authService.login(loginData);

      res.json({
        success: true,
        data: result
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

// POST /auth/logout
router.post(
  '/logout',
  authenticateToken,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      await authService.logout(req.user!.id);

      res.json({
        success: true,
        data: { message: 'Logged out successfully' }
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

// POST /auth/refresh
router.post('/refresh', async (req, res: any) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token required',
          code: 'MISSING_REFRESH_TOKEN'
        }
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result
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
});

export default router;