import os
from flask import url_for
user = 'raushan2003@gmail.com'
data = {}
scan_path = os.path.join('uploads', user)
for x in os.walk(scan_path):
    for ds in x[1]:
        data[ds] = {}
        # algo_img_data = {}
        for algos in os.walk(os.path.join(x[0], ds, 'output')):
            for algo in algos[1]:
                for images in os.walk(os.path.join(x[0], ds, 'output',algo)):
                    list_img = [img for img in images[2] ]
                    data[ds].update({algo:list_img})
                    break
    break

print(data)
