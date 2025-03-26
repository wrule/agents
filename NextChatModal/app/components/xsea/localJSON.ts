const sessionHandler = {
  get: (target: any, property: any) => {
    try {
      return JSON.parse(sessionStorage.getItem(property) as string);
    } catch (error) {
      return null;
    }
  },
  set: (target: any, property: any, value: any) => {
    sessionStorage.setItem(property, JSON.stringify(value));
    return true;
  },
};

const localHandler = {
  get: (target: any, property: any) => {
    try {
      return JSON.parse(localStorage.getItem(property) as string);
    } catch (error) {
      return null;
    }
  },
  set: (target: any, property: any, value: any) => {
    localStorage.setItem(property, JSON.stringify(value));
    return true;
  },
};

const _SessionJSON = new Proxy({}, sessionHandler);
const LocalJSON = new Proxy({}, localHandler);

// 临时换成LocalJSON
export const SessionJSON = LocalJSON;
export default LocalJSON;
