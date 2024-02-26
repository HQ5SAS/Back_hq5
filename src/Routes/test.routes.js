import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    const successMessage = 'La operación se realizó con éxito pro';
    res.status(200).send(successMessage);
  });

export default router;