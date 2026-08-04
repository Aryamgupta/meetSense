import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')



/**
 * Generates a 768-dim embedding for a piece of text, matching the
 * meeting_embeddings.embedding column's vector(768) type.
 * Use this everywhere an embedding is generated — extract route,
 * ask route, dedup checks — so every stored/queried vector is
 * produced identically and dimension mismatches can't happen.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}
