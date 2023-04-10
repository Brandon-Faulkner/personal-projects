import numpy as np

def compute_vector(basis, vector):
    """
    Create the basis and vector arrays in numpy,
    then get the inverse of the basis and compute the
    vector x by using the dot product of inverse * vector
    """
    basis = np.array(basis)
    vector = np.array(vector)

    #Compute the Inverse of the basis matrix
    inverse = np.linalg.inv(basis)

    #Compute the vector x as the product of the inverse and the vector
    x = np.dot(inverse, vector)

    return x

basis = [[0,-4,6], [-1,0,6], [-1,0,3]]
vector = [-2,6,1]

x = compute_vector(basis, vector)

print("Vector X:")
print(x)