function parseAIResponse2(response) {
  // Captura os parâmetros entre colchetes e o restante da resposta
  const match = response.match(/^\[(.*?)\]\s*(.*)$/s);
  if (match) {
    const paramsString = match[1].trim();
    // Separa os parâmetros pela vírgula (removendo espaços em branco ao redor)
    const paramsArray = paramsString.split(/\s*,\s*/);

    const data = {};
    paramsArray.forEach(param => {
      // Separa apenas na primeira ocorrência de "=" para suportar valores com "="
      const [key, ...rest] = param.split('=');
      if (key && rest.length > 0) {
        data[key.trim()] = rest.join('=').trim();
      }
    });

    // Se nenhum parâmetro válido foi encontrado, retorna a resposta original
    if (Object.keys(data).length === 0) {
      return {
        newAction: null,
        newParams: null,
        newResponse: response
      };
    }

    return {
      newAction: data.action || null,
      newParams: data,
      newResponse: match[2].trim()
    };
  }

  return {
    newAction: null,
    newParams: null,
    newResponse: response
  };
}

const res = parseAIResponse2("[action=move_card,card_id=67e050facded5dfa48bdb407,list_id=67a568f1b70c4b701afc5431] Claro! Vou mover o cartão 'novo-card' da lista 'Done' para a lista 'Doing' no quadro 'Backlog'.");

console.log("Ação:", res);