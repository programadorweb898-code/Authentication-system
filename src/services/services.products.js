export const getProducts = async () => {
  const response = await fetch('http://fakestoreapi.com/products');
  if (!response.ok) {
    throw new Error('Error al obtener los productos');
  }
  return response.json();
};

export const getProductById = async (id) => {
  const response = await fetch(`https://fakestoreapi.com/products/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener un producto');
  }
  return response.json();
};
