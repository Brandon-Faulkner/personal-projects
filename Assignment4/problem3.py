# First, represent the set as a matrix. Determine the RREF of the matrix.
# The number of non-zero rows is equal to the dimension of the set.
# To find the basis, look at non-zero rows in RREF and use the corresponding rows from the original.

import numpy as np
import sympy as sp

# Create the numpy matrix of the set
A = np.array([[2, 3, 0], [1, 1, -2], [4, 1, 0], [3, -1, -1]])

# Convert A to sympy matrix then row reduce
matA = sp.Matrix(A)
refA = matA.rref()
refA = np.array(refA[0])

# Count number of non-zero rows in REF
dim = np.count_nonzero(np.abs(np.diag(refA)) > 1e-10)

# Get the basis vectors from A
basis = A[:dim, :].T

#Print
print("Dimension of the set:", dim)
print("Basis for the set:\n", basis)

