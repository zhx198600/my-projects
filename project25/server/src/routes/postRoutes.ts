import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  getPostComments,
  createComment,
  deleteComment,
} from '../controllers/postController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', authenticate, createPost);
router.get('/:id/comments', getPostComments);
router.post('/:id/comments', authenticate, createComment);
router.delete('/comments/:commentId', authenticate, deleteComment);

export default router;
