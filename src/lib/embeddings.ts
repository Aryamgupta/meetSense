import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const EMBEDDING_DIM = 768

/**
 * Truncates a Matryoshka-trained embedding (gemini-embedding-001 defaults
 * to 3072 dims) down to a target dimension and re-normalizes it to unit
 * length. Re-normalization is required — cosine similarity on a
 * truncated-but-not-renormalized vector will be subtly wrong.
 */
function truncateEmbedding(embedding: number[], targetDim: number = EMBEDDING_DIM): number[] {
  const truncated = embedding.slice(0, targetDim)
  const magnitude = Math.sqrt(truncated.reduce((sum, val) => sum + val * val, 0))
  return magnitude === 0 ? truncated : truncated.map((val) => val / magnitude)
}

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
  return truncateEmbedding(result.embedding.values, EMBEDDING_DIM)
}
