export default function  sanitizeFileName(name) {
    // Remove acentos e substitui espaços por underscores
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-zA-Z0-9._-]/g, "_"); // Substitui caracteres inválidos por "_"
  };
