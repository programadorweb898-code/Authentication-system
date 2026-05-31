import { getProducts, getProductById } from '../services/products.services.js';
export const getProductsControllers = async (req, res, next) => {
  try {
    const result = await getProducts();
    res.json({ productos: result });
  } catch (error) {
    next(error);
  }
};

export const getProductController = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await getProductById(id);
    res.json({ producto: result });
  } catch (err) {
    next(err);
  }
};
