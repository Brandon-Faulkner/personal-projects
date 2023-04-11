import numpy as np
import matplotlib.pyplot as plt

# ------ A ------
def cosine_similarity(vectors):
    """
    Calculates the cosine similarity matrix of a set of vectors
    """
    # Compute norms of the vectors
    norms = np.linalg.norm(vectors, axis=1)

    # Compute the dot product of all pairs of vectors
    dot_products = np.dot(vectors, vectors.T)

    # Compute cosine similarity
    cosine_similarities = dot_products / np.outer(norms,norms)

    return cosine_similarities

# ------ B ------
# Generate a random matrix to use in function
N = 10
M = 4
vectors = np.random.rand(N,M)

# Compute cosine similarity matrix
cosine_similarities = cosine_similarity(vectors)

# ------ C ------
plt.matshow(cosine_similarities)
plt.colorbar()
plt.show()