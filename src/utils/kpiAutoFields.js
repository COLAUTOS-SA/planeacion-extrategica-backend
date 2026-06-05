export const normalizeFieldName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/%/g, " porcentaje ")
    .replace(/\s+/g, " ")
    .trim();

export const getFieldKey = (value) => {
  const normalized = normalizeFieldName(value);

  if (normalized === "objetivo") return "objetivo";
  if (normalized === "resultado" || normalized === "citas efectivas") {
    return "resultado";
  }
  if (
    normalized === "cumplimiento" ||
    normalized === "porcentaje cumplimiento" ||
    normalized === "porcentaje de cumplimiento"
  ) {
    return "cumplimiento";
  }
  if (normalized === "total") return "total";

  return normalized;
};

export const detectAutoFields = (campos = []) => {
  const keys = new Set(campos.map((campo) => getFieldKey(campo.nombre)));
  const hasObjective = keys.has("objetivo");
  const hasResult = keys.has("resultado");

  return campos.map((campo) => {
    const key = getFieldKey(campo.nombre);

    if (key === "cumplimiento" && hasObjective && hasResult) {
      return {
        ...campo,
        tipo: "porcentaje",
        editable: false,
        es_calculado: true,
        formula: "(resultado / objetivo) * 100",
      };
    }

    if (key === "total") {
      return {
        ...campo,
        tipo: campo.tipo === "texto" ? "numero" : campo.tipo || "numero",
        editable: false,
        es_calculado: true,
        formula: "SUM(...)",
      };
    }

    return campo;
  });
};

export const computeAutoFieldValue = (campo, valuesByName = {}) => {
  const key = getFieldKey(campo?.nombre);

  if (key === "cumplimiento") {
    const objetivo = Number(valuesByName.objetivo);
    const resultado = Number(valuesByName.resultado);
    if (!Number.isNaN(objetivo) && objetivo > 0 && !Number.isNaN(resultado)) {
      return (resultado / objetivo) * 100;
    }
  }

  if (key === "total") {
    return Object.entries(valuesByName).reduce((acc, [fieldName, value]) => {
      const fieldKey = getFieldKey(fieldName);
      const numberValue = Number(value);
      if (
        fieldKey === "total" ||
        fieldKey === "cumplimiento" ||
        Number.isNaN(numberValue)
      ) {
        return acc;
      }

      return acc + numberValue;
    }, 0);
  }

  return null;
};
