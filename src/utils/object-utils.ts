// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "formdata-polyfill";

export function objectToFormData(obj: unknown, form?: FormData): FormData {
  const fd = form || new FormData();

  for (const property in obj) {
    if (!obj.hasOwnProperty(property)) continue;

    const value = obj[property];
    // const formKey = namespace ? `${namespace}[${property}]` : property;
    const formKey = property;

    if (value instanceof File) {
      console.log(`Appending file: ${formKey}`, value);
      fd.append(formKey, value);
    } else if (value instanceof Date) {
      fd.append(formKey, value.toISOString());
    } else if (typeof value === 'boolean') {
      // Laravel-compatible boolean: send "1" or "0"
      fd.append(formKey, value ? '1' : '0');
    } else if (typeof value === 'number') {
      fd.append(formKey, value.toString()); // or just value
    } else if (typeof value === 'string') {
      fd.append(formKey, value);
    } else if (typeof value === 'object' && value !== null) {
      // objectToFormData(value, fd, formKey); // recursive for nested object
      console.warn('Skipping nested object:', formKey);
    } else if (value !== undefined && value !== null) {
      fd.append(formKey, String(value));
    }
  }

  console.log('FormData created:', fd);

  return fd;
}


export const resetObject = (obj: Record<string, unknown>): void => {
  for (const prop of Object.getOwnPropertyNames(obj)) {
    delete obj[prop];
  }
};

export const sanitizePhoneNumbers = (
  obj: Record<string, unknown>,
  fields: string[] = []
): Record<string, unknown> => {
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      const phoneNumber = obj[field];
      if (phoneNumber) {
        obj[field] = phoneNumber.toString().replace("+", "");
      }
    }
  });
  return obj;
};

export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error("Invalid data URL");
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mime });
};

export const blobToFile = (blobSource: Blob, filename: string): File => {
  return new File([blobSource], filename, {
    lastModified: Date.now(),
    type: blobSource.type,
  });
};