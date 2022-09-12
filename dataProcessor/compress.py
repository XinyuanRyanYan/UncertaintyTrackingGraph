# python script for reducing the size of the matrix data
import numpy as np
from pyrsistent import m
PATH_PREFIX = '../static/data'    # the prefix of the data path


data_name = 'Sample'        # HeatedFlow VortexStreet IonizationFront jungtelziemniak
MATRIX_FILE_PREFIX = PATH_PREFIX+'/'+data_name+'/matrix/data_'
# MATRIX_FILE_PREFIX = PATH_PREFIX+'/'+data_name+'/matrix/monoMesh_'

t = 20;   # 31; 59; 123; 499
for i in range(t):
    file_name = MATRIX_FILE_PREFIX+str(i)+'.txt'
    mtx = np.loadtxt(file_name)
    np.savetxt(MATRIX_FILE_PREFIX+str(i)+'_min.txt', mtx, delimiter=' ', fmt='%.3e')    # %.4e; Ion .3e