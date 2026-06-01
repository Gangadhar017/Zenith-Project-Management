import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { EmailService } from '../services/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-zenith-jwt-key-2026-wow';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing email, password, or name.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Generate secure 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert the OTPVerification record
    await prisma.oTPVerification.upsert({
      where: { email },
      update: {
        otpCode,
        name,
        password: passwordHash,
        expiresAt
      },
      create: {
        email,
        otpCode,
        name,
        password: passwordHash,
        expiresAt
      }
    });

    // Send the verification OTP email asynchronously
    EmailService.sendRegistrationOTP(email, otpCode, name);

    return res.status(200).json({
      message: 'Verification OTP sent to your email. Please verify to complete registration.'
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Missing email or OTP code.' });
    }

    const verification = await prisma.oTPVerification.findUnique({
      where: { email }
    });

    if (!verification || verification.otpCode !== otpCode) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (verification.expiresAt < new Date()) {
      await prisma.oTPVerification.delete({ where: { email } }).catch(() => {});
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Create the permanent User profile
    const user = await prisma.user.create({
      data: {
        email: verification.email,
        passwordHash: verification.password,
        name: verification.name,
        image: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(verification.name)}`
      }
    });

    // Automatically create a default personal workspace for them
    const workspaceName = `${verification.name}'s Hub`;
    const slug = `${verification.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workspace-${Date.now().toString().slice(-4)}`;
    
    await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug,
        description: 'Your default workspace. Welcome to Zenith!',
        memberships: {
          create: {
            userId: user.id,
            role: 'OWNER'
          }
        }
      }
    });

    // Clean up verification record
    await prisma.oTPVerification.delete({ where: { email } }).catch(() => {});

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: {
          include: {
            workspace: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      memberships: user.memberships
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, email, image, currentPassword, newPassword } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ message: 'Email address is already in use.' });
      }
      dataToUpdate.email = email;
    }
    if (image) dataToUpdate.image = image;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user || !user.passwordHash) {
        return res.status(400).json({ message: 'User not found.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' });
      }
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate
    });

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image
      }
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Missing email address.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // To prevent email enumeration, we return success even if user doesn't exist
    if (!user) {
      return res.json({
        message: 'If that email address exists in our database, we will send you an email to reset your password.'
      });
    }

    // Generate secure cryptographically secure recovery token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Upsert the reset token
    await prisma.passwordResetToken.upsert({
      where: { email },
      update: { token, expiresAt },
      create: { email, token, expiresAt }
    });

    // Send the email with recovery link
    EmailService.sendPasswordResetLink(email, token, user.name);

    return res.json({
      message: 'If that email address exists in our database, we will send you an email to reset your password.'
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Missing email, token, or new password.' });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { email }
    });

    if (!resetRecord || resetRecord.token !== token) {
      return res.status(400).json({ message: 'Invalid or expired recovery token.' });
    }

    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { email } }).catch(() => {});
      return res.status(400).json({ message: 'Invalid or expired recovery token.' });
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    // Clean up reset token so it is strictly single-use
    await prisma.passwordResetToken.delete({ where: { email } }).catch(() => {});

    return res.json({
      message: 'Password reset successful. You can now log in.'
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};
