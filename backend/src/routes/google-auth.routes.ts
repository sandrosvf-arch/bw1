import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport';

const router = Router();

// Iniciar autenticação com Google
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

// Callback do Google OAuth
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      console.log('Google OAuth Callback - User:', user ? user.email : 'No user');
      
      if (!user) {
        console.error('No user in OAuth callback');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_user`);
      }

      // Gerar token JWT
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '7d' as any }
      );

      console.log('Token gerado, redirecionando para:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`);

      // Redirecionar para o frontend com o token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);

export default router;
