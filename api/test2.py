import glob
import os
import subprocess
DCM_NII_FILE_NOT_FOUND_MSG = '.dcm or .nii file not found in zip'

def move__dcm_nii_files(extracted_dir_name, final_path):


    file = None

    for dirpath, dirnames, filenames in os.walk(extracted_dir_name):
        for filename in [f for f in filenames if f.endswith(".dcm") or f.endswith(".nii") ]:
            file = os.path.join(dirpath,filename)
            break;
        if file:
            break;

    if not file:
        raise Exception(DCM_NII_FILE_NOT_FOUND_MSG)
    else:
        parent_path = os.path.dirname(file)
        subprocess.call("mv {}/* {}/".format(parent_path, final_path), shell=True)

if __name__=='__main__':
    move__dcm_nii_files('uploads/raushan2003@gmail.com/exam0430-2/extracted_temp','uploads/raushan2003@gmail.com/exam0430-2/extracted')