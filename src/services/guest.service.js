import prisma from "../config/prisma";
import randomUUID from "crypto";
import logger from "../libs/logger.lib.js";


class GuestService {
  async createGuestSession(deviceInfo = null) {
    const sessionToken = randomUUID();
    
    const guest = await prisma.user.create({
      data: {
        fullName: `Invité_${Date.now()}`,
        role: 'GUEST',
        guestSessionId: sessionToken,
      },
    });

    await prisma.guestSession.create({
      data: {
        sessionToken,
        deviceInfo,
        ipAddress: null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        userId: guest.id,
      },
    });

    logger.logEvent('GUEST_SESSION_CREATED', guest.id, { sessionToken });

    return {
      guestId: guest.id,
      sessionToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  async getGuestBySessionId(sessionToken) {
    const session = await prisma.guestSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  }

  async updateGuestInfo(guestId, data) {
    const guest = await prisma.user.update({
      where: { id: guestId },
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      },
    });

    return guest;
  }
}

export default new GuestService();