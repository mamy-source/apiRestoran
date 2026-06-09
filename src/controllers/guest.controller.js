import GuestService from "../services/guest.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { createGuestSessionValidator, updateGuestValidator } from "../validations/guest.validators.js";


export const createGuestSession = asyncHandler(async (req, res) => {
  const { deviceInfo } = req.body;
  const session = await GuestService.createGuestSession(deviceInfo);
  
  // Set cookie
  res.cookie('session_token', session.sessionToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  sendCreated(res, session, 'Session guest créée avec succès');
});

export const getGuestInfo = asyncHandler(async (req, res) => {
  const guest = req.guest;
  sendSuccess(res, {
    id: guest.id,
    fullName: guest.fullName,
    phoneNumber: guest.phoneNumber,
    role: guest.role,
  }, 'Informations guest récupérées');
});

export const updateGuestInfo = asyncHandler(async (req, res) => {
  const { error, value } = updateGuestValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const guest = await GuestService.updateGuestInfo(req.guest.id, value);
  sendSuccess(res, guest, 'Informations mises à jour');
});