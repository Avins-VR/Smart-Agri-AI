import os

# Main dataset folder
base_path = r"C:\Users\avins\Downloads\Pest Data"

# Folders to check
folders = ["train", "valid", "test"]

# Names to replace
old_names = ["unhealthy"]

for folder in folders:

    # Images folder
    image_path = os.path.join(base_path, folder, "images")

    # Labels folder
    label_path = os.path.join(base_path, folder, "labels")

    # Rename image files
    if os.path.exists(image_path):
        for file_name in os.listdir(image_path):

            new_name = file_name

            for old in old_names:
                if old in new_name:
                    new_name = new_name.replace(old, "pest attack")

            if new_name != file_name:
                old_file = os.path.join(image_path, file_name)
                new_file = os.path.join(image_path, new_name)

                os.rename(old_file, new_file)

                print(f"Renamed Image: {file_name} -> {new_name}")

    # Rename label files
    if os.path.exists(label_path):
        for file_name in os.listdir(label_path):

            new_name = file_name

            for old in old_names:
                if old in new_name:
                    new_name = new_name.replace(old, "pest attack")

            if new_name != file_name:
                old_file = os.path.join(label_path, file_name)
                new_file = os.path.join(label_path, new_name)

                os.rename(old_file, new_file)

                print(f"Renamed Label: {file_name} -> {new_name}")

print("\nAll files renamed successfully!")