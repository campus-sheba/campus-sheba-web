export function convertPayloadToFormData(payload) {
  // console.log(payload);
  const formData = new FormData();

  const appendFormData = (data, parentKey = '') => {
    if (data === null || data === undefined) return;

    // ✅ Handle File or Blob directly
    if (data instanceof File || data instanceof Blob) {
      formData.append(parentKey, data);
      return;
    }

    if (Array.isArray(data)) {
      data.forEach(value => {
        appendFormData(value, parentKey); // 🔥 No index, same key
      });
    } else if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;
        appendFormData(value, fullKey);
      });
    } else {
      formData.append(parentKey, data);
    }
  };

  appendFormData(payload);
  return formData;
}
