import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        phone,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Gerar token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const jwtOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      jwtSecret,
      jwtOptions
    );

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
      },
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Buscar usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Gerar token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const jwtOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      jwtOptions
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Obter usuário atual
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone, avatar, created_at')
      .eq('id', req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
