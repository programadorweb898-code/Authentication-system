import { AppDataSource } from '../../../../infrastructure/database/data-source.js';
import { Product } from '../../../../infrastructure/database/entities/product.entity.js';
import { ProductImage } from '../../../../infrastructure/database/entities/productImage.entity.js';

const MAX_IMAGES_PER_PRODUCT = 5;
const URL_REGEX = /^https?:\/\/[^\s"'<>]+$/;

const syncMainImage = async (manager, productId) => {
  const repository = manager.getRepository(ProductImage);
  const images = await repository.find({ where: { productId }, order: { createdAt: 'ASC' } });
  const productRepo = manager.getRepository(Product);
  const product = await productRepo.findOneBy({ id: productId });
  if (!product) return;

  const currentMain = images.find((img) => img.isMain);
  const mainImage = currentMain || images[0] || null;

  if (!currentMain && mainImage) {
    await repository.update({ productId }, { isMain: false });
    mainImage.isMain = true;
    await repository.save(mainImage);
  }

  product.imageUrl = mainImage ? mainImage.url : null;
  await productRepo.save(product);
};

export const ProductImageService = {
  async addUrls(productId, urls) {
    if (!Array.isArray(urls) || urls.length === 0) {
      const error = new Error('Se requiere al menos un link');
      error.statusCode = 400;
      throw error;
    }

    const validUrls = [...new Set(urls)].filter((u) => typeof u === 'string' && URL_REGEX.test(u));
    if (validUrls.length === 0) {
      const error = new Error('Ninguno de los links proporcionados es válido');
      error.statusCode = 400;
      throw error;
    }

    return await AppDataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ProductImage);
      const product = await manager.getRepository(Product).findOneBy({ id: productId });
      if (!product) {
        const error = new Error('Producto no encontrado');
        error.statusCode = 404;
        throw error;
      }

      const existing = await repository.find({ where: { productId } });
      const existingUrls = new Set(existing.map((img) => img.url));
      const newUrls = validUrls.filter((u) => !existingUrls.has(u));

      if (existing.length + newUrls.length > MAX_IMAGES_PER_PRODUCT) {
        const error = new Error(
          `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto. Ya tiene ${existing.length}, intentás agregar ${newUrls.length}.`
        );
        error.statusCode = 400;
        throw error;
      }

      const created = newUrls.map((url) =>
        repository.create({ productId, url, isMain: existing.length === 0 && url === newUrls[0] })
      );
      const saved = await repository.save(created);

      await syncMainImage(manager, productId);

      return saved;
    });
  },

  async addFromFile(productId, file) {
    const { extractUrlsFromFile } = await import('../utils/link-extractor.js');
    const urls = await extractUrlsFromFile(file);

    if (urls.length === 0) {
      const error = new Error('No se encontraron links en el archivo');
      error.statusCode = 400;
      throw error;
    }

    return await this.addUrls(productId, urls);
  },

  async list(productId) {
    const repository = AppDataSource.getRepository(ProductImage);
    return await repository.find({ where: { productId }, order: { createdAt: 'ASC' } });
  },

  async remove(productId, imageId) {
    return await AppDataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ProductImage);
      const result = await repository.delete({ id: imageId, productId });
      if (result.affected === 0) return false;
      await syncMainImage(manager, productId);
      return true;
    });
  },

  async setMain(productId, imageId) {
    return await AppDataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ProductImage);
      const image = await repository.findOneBy({ id: imageId, productId });
      if (!image) return null;

      await repository.update({ productId }, { isMain: false });
      image.isMain = true;
      await repository.save(image);

      await syncMainImage(manager, productId);
      return image;
    });
  },
};
