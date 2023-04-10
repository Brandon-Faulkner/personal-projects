import numpy as np 
import sympy as sp

# Create the numpy Matrices for A and b
A = np.array([[3, 8, -5], [3, -6, -7], [3, 4, 2]])
b = np.array([-1, -1, 3])

# Convert A to sympy matrix
matA = sp.Matrix(A) 

# ------ A ------
refA = matA.rref() # Compute REF of matrix A
refA = np.array(refA[0]) # Convert matrix A back to numpy

print("REF of A:") 
print(refA)

# ------ B ------
columnspaceA = matA.columnspace() # Compute col space of A

print("\nColumn space of A:")
print(columnspaceA)

# ------ C ------
x = np.linalg.solve(A, b) # Solve Ax = b

print('\nAx = b:')
print(x)

# ------ D ------
nullspaceA = matA.nullspace() # Compute nul space of A

print("\nThe null space of A is:")
print(nullspaceA)