//Função para sanitizar os dados de entrada, removendo tags HTML e caracteres especiais

export const sanitizer = async (value) => {
  value.forEach((element, index) => {
    if (typeof element === "string" && element !== "") {
      element = element.replace(/<script.*?>.*?<\/script>/gi, "");
      element = element.replace(/<.*?>/g, "");
      element = element.replace(/&/g, "&amp;");
      element = element.replace(/</g, "&lt;");
      element = element.replace(/>/g, "&gt;");
      element = element.replace(/"/g, "&quot;");
      element = element.trim();
    }
    value[index] = element;
  });

  return value;
};
