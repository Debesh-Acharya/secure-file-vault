import {Router} from 'express';
import {register,
    login,
    logout,
    refreshAccessToken,
    updateProfile,
    updatePassword,
    getUserProfile} from '../controllers/user.controller.js';
import {protect} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

// Protected User Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

export default router;