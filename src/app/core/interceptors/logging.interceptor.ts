import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const LoggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(`📤 [HTTP REQUEST] ${req.method} ${req.url}`);

  console.log('📋 Headers:', JSON.stringify(req.headers.keys()));

  return next(req).pipe(
    tap({
      next: (event) => {
        console.log(`📥 [HTTP RESPONSE] ${req.method} ${req.url} - SUCCESS`);
      },
      error: (error) => {
        console.error(`❌ [HTTP ERROR] ${req.method} ${req.url}`);
        console.error('📊 Status:', error.status);
        console.error('📝 Message:', error.message);
        console.error('🔗 URL complète:', error.url);

        if (error.status === 403) {
          console.error('🔒 ACCÈS REFUSÉ (403) - Raisons possibles:');
          console.error('1. Token JWT manquant ou invalide');
          console.error('2. Token expiré');
          console.error('3. Autorisations insuffisantes');
          console.error('4. Problème CORS');
        }
      }
    })
  );
};
