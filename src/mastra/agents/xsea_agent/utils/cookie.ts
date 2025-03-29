
function parseCookieString(cookieStr?: string): Record<string, string> {
  if (!cookieStr) {
    return { };
  }
  return cookieStr.split(';')
    .map(cookie => cookie.trim())
    .reduce<Record<string, string>>((cookies, cookie) => {
      if (cookie) {
        const separatorIndex = cookie.indexOf('=');
        // 处理有等号和没有等号的情况
        const name = separatorIndex > -1 
          ? cookie.slice(0, separatorIndex).trim() 
          : cookie.trim();
        const value = separatorIndex > -1 
          ? cookie.slice(separatorIndex + 1).trim() 
          : '';
        if (name) {
          cookies[name] = decodeURIComponent(value || '');
        }
      }
      return cookies;
    }, { });
}

export function cookieEnvId(cookie?: string) {
  return parseCookieString(cookie)['sys_env_id'] || '1';
}
