import {Router} from 'express';
import {register,
    login,
    logout,
    refreshAccessToken,
    updateProfile,
    updatePassword,
    getUserProfile,
    uploadFile,
    getFile,
    downloadFile,
    deleteFile,
    getAllFiles
} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import {protect} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/all', protect, getAllFiles);
router.get('/:fileId/download', protect, downloadFile);
router.get('/:fileId', protect, getFile);
router.delete('/:fileId', protect, deleteFile);

// Protected User Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

export default router;