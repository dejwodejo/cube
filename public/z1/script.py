import os

def get_subdirectories(path="."):
  """
  Get all subdirectories in the given path.

  Args:
    path: The path to search for subdirectories. Defaults to the current directory.

  Returns:
    A list of subdirectory names.
  """
  return [
      name
      for name in os.listdir(path)
      if os.path.isdir(os.path.join(path, name))
  ]


if __name__ == "__main__":
  directories = get_subdirectories()
  for directory in directories:
    print(f'"{directory}",')
