import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { signToken, signManagerToken } from "../../utils/jwt";
import { AppError } from "../../utils/response";

export class AuthService {
  async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError("INVALID_LOGIN", "Invalid email or password", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("UNAUTHORIZED", "User account is deactivated. Please contact an admin.", 403);
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new AppError("INVALID_LOGIN", "Invalid email or password", 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    return user;
  }

  async changePassword(userId: string, currentPlain: string, newPlain: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPlain, user.passwordHash);
    if (!isMatch) {
      throw new AppError("INVALID_PASSWORD", "Current password does not match", 400);
    }

    const newHash = await bcrypt.hash(newPlain, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true };
  }

  private async checkPinMatch(inputPin: string, storedPin: string | null, userIdToUpgrade?: string): Promise<boolean> {
    if (!storedPin) return false;
    // Check plaintext match
    if (storedPin === inputPin) {
      // Auto-upgrade legacy plaintext PIN to bcrypt in the background
      if (userIdToUpgrade) {
        bcrypt.hash(inputPin, 10).then((hashed) => {
          prisma.user.update({ where: { id: userIdToUpgrade }, data: { pinCode: hashed } }).catch(() => null);
        });
      }
      return true;
    }
    // Check bcrypt hash match
    if (storedPin.startsWith("$2a$") || storedPin.startsWith("$2b$") || storedPin.startsWith("$2y$")) {
      try {
        return await bcrypt.compare(inputPin, storedPin);
      } catch {
        return false;
      }
    }
    return false;
  }

  async pinLogin(pinCode: string) {
    if (!pinCode || pinCode.trim().length === 0) {
      throw new AppError("INVALID_PIN", "PIN code is required", 400);
    }

    const cleanPin = pinCode.trim();
    const activeUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        pinCode: { not: null },
      },
    });

    let matchedUser = null;
    for (const u of activeUsers) {
      if (await this.checkPinMatch(cleanPin, u.pinCode, u.id)) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      throw new AppError("INVALID_PIN", "Invalid PIN code entered", 401);
    }

    const token = signToken({
      userId: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
    });

    return {
      token,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        status: matchedUser.status,
      },
    };
  }

  async verifyManagerPin(pinCode: string) {
    if (!pinCode || pinCode.trim().length === 0) {
      throw new AppError("INVALID_PIN", "Manager PIN is required", 400);
    }

    const cleanPin = pinCode.trim();
    const managers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
        pinCode: { not: null },
      },
    });

    let matchedManager = null;
    for (const m of managers) {
      if (await this.checkPinMatch(cleanPin, m.pinCode, m.id)) {
        matchedManager = m;
        break;
      }
    }

    if (!matchedManager) {
      throw new AppError("UNAUTHORIZED_MANAGER_PIN", "Invalid Manager PIN or insufficient privileges", 403);
    }

    const managerToken = signManagerToken({
      managerId: matchedManager.id,
      managerName: matchedManager.name,
      role: "ADMIN",
      action: "MANAGER_OVERRIDE",
    });

    return {
      valid: true,
      managerToken,
      manager: {
        id: matchedManager.id,
        name: matchedManager.name,
        email: matchedManager.email,
      },
    };
  }

  async updatePin(userId: string, pinCode: string) {
    if (!pinCode || pinCode.trim().length < 4) {
      throw new AppError("INVALID_PIN", "PIN must be at least 4 digits", 400);
    }

    const hashedPin = await bcrypt.hash(pinCode.trim(), 10);
    await prisma.user.update({
      where: { id: userId },
      data: { pinCode: hashedPin },
    });

    return { success: true };
  }

  async unlockTerminal(pinCode: string, currentUserId?: string) {
    if (!pinCode || pinCode.trim().length === 0) {
      throw new AppError("INVALID_PIN", "PIN code is required", 400);
    }

    const cleanPin = pinCode.trim();

    // 1. If currentUserId is provided, check if it matches the current user's PIN
    if (currentUserId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
      });
      if (currentUser && currentUser.status === "ACTIVE") {
        const matches = await this.checkPinMatch(cleanPin, currentUser.pinCode, currentUser.id);
        if (matches) {
          return { unlocked: true, unlockedBy: "SELF", userName: currentUser.name };
        }
      }
    }

    // 2. Check if an active ADMIN / Manager is unlocking the terminal
    const activeAdmins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
        pinCode: { not: null },
      },
    });

    for (const adminUser of activeAdmins) {
      if (await this.checkPinMatch(cleanPin, adminUser.pinCode, adminUser.id)) {
        return { unlocked: true, unlockedBy: "MANAGER", userName: adminUser.name };
      }
    }

    // 3. Fallback: check if ANY active staff user has this PIN
    const activeStaff = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        pinCode: { not: null },
      },
    });

    for (const staffUser of activeStaff) {
      if (await this.checkPinMatch(cleanPin, staffUser.pinCode, staffUser.id)) {
        return { unlocked: true, unlockedBy: "STAFF", userName: staffUser.name };
      }
    }

    throw new AppError("INVALID_PIN", "Incorrect PIN. Enter your staff PIN or Manager PIN to unlock.", 401);
  }

  async guestLogin() {
    let guestUser = await prisma.user.findFirst({
      where: { role: "GUEST" },
    });

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          name: "Guest Visitor",
          email: "guest@pos.local",
          passwordHash: "GUEST_READONLY",
          role: "GUEST",
          status: "ACTIVE",
          pinCode: "0000",
        },
      });
    }

    const token = signToken({
      userId: guestUser.id,
      email: guestUser.email,
      role: guestUser.role,
    });

    return {
      token,
      user: {
        id: guestUser.id,
        name: guestUser.name,
        email: guestUser.email,
        role: guestUser.role,
        status: guestUser.status,
      },
    };
  }
}

export const authService = new AuthService();