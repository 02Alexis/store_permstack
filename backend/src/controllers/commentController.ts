import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Create comment (protected)
export const createComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { productId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "El contenido del comentario es obligatorio." });

    // verify product exists
    const product = await queries.getProductById(productId);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const comment = await queries.createComment({
      content,
      userId,
      productId,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error al crear el comentario:", error);
    res.status(500).json({ error: "No se pudo crear el comentario" });
  }
};

// Delete comment (protected - owner only)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { commentId } = req.params;

    // check if comment exists and belongs to user
    const existingComment = await queries.getCommentById(commentId);
    if (!existingComment) return res.status(404).json({ error: "Comentario no encontrado" });

    if (existingComment.userId !== userId) {
      return res.status(403).json({ error: "Solo puedes eliminar tus propios comentarios" });
    }

    await queries.deleteComment(commentId);
    res.status(200).json({ message: "Comentario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el comentario:", error);
    res.status(500).json({ error: "No se pudo eliminar el comentario" });
  }
};