import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../database/connection';
import { AppError } from '../middleware/errorHandler';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  // Verifica se email já existe
  const existingUser = await db.oneOrNone(
    'SELECT id FROM users WHERE email = $1',
    [data.email]
  );

  if (existingUser) {
    throw new AppError('Email já cadastrado', 400);
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Cria usuário
  const user = await db.one(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at as "createdAt"`,
    [data.name, data.email, hashedPassword, 'USER']
  );

  // Gera token
  const token = generateToken({
    userId: user.id,
    role: user.role
  });

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  // Busca usuário
  const user = await db.oneOrNone(
    'SELECT * FROM users WHERE email = $1',
    [data.email]
  );

  if (!user) {
    throw new AppError('Email ou senha inválidos', 401);
  }

  // Verifica senha
  const passwordMatch = await bcrypt.compare(data.password, user.password);

  if (!passwordMatch) {
    throw new AppError('Email ou senha inválidos', 401);
  }

  // Gera token
  const token = generateToken({
    userId: user.id,
    role: user.role
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await db.oneOrNone(
    `SELECT id, name, email, role, created_at as "createdAt"
     FROM users WHERE id = $1`,
    [userId]
  );

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.json(user);
};
