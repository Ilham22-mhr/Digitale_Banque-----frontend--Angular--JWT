import { HttpInterceptorFn } from '@angular/common/http';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login')) {
    console.log('🔓 Skip JWT pour login');
    return next(req);
  }

  const token = localStorage.getItem('token');

  console.log('🔍 JWT Interceptor activé pour:', req.url);
  console.log('🔑 Token présent:', token ? 'OUI' : 'NON');

  if (token) {
    console.log('📏 Longueur token:', token.length);
    console.log('🔐 Token (début):', token.substring(0, 30) + '...');

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Header Authorization ajouté');
    console.log('📋 Headers finaux:', Array.from(cloned.headers.keys()));

    return next(cloned);
  } else {
    console.warn('⚠️ Pas de token JWT!');
    console.warn('URL actuelle:', req.url);
    console.warn('Si c\'est une page protégée, l\'utilisateur devrait être redirigé vers /login');
  }

  return next(req);
};
