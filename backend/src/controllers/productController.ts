import type { Request, Response } from "express";

import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Get all products (public)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await queries.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "No se pudieron obtener los productos" });
  }
};

// Get products by current user (protected)
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const products = await queries.getProductsByUserId(userId);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener los productos del usuario:", error);
    res.status(500).json({ error: "No se pudieron obtener los productos del usuario" });
  }
};

// Get single product by ID (public)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await queries.getProductById(id);

    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "No se pudo obtener el producto" });
  }
};

// Create product (protected)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, imageUrl } = req.body;

    if (!title || !description || !imageUrl) {
      res.status(400).json({ error: "El título, la descripción y la URL de la imagen son obligatorios." });
      return;
    }

    const product = await queries.createProduct({
      title,
      description,
      imageUrl,
      userId,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ error: "No se pudo crear el producto" });
  }
};

// Update product (protected - owner only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { title, description, imageUrl } = req.body;

    // Check if product exists and belongs to user
    const existingProduct = await queries.getProductById(id);
    if (!existingProduct) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "Solo puedes actualizar tus propios productos" });
      return;
    }

    const product = await queries.updateProduct(id, {
      title,
      description,
      imageUrl,
    });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "No se pudo actualizar el producto" });
  }
};

// Delete product (protected - owner only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Check if product exists and belongs to user
    const existingProduct = await queries.getProductById(id);
    if (!existingProduct) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "Solo puedes eliminar tus propios productos" });
      return;
    }

    await queries.deleteProduct(id);
    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "No se pudo eliminar el producto" });
  }
};