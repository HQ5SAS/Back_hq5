import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('La operación se realizó con éxito pro');
});

export default router;