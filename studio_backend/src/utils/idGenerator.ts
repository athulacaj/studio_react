export const generateFileId = (relativePath: string, name: string): string => {
  if (!relativePath || relativePath.trim() === '') {
    return name;
  }
  return `${relativePath}/${name}`;
};
