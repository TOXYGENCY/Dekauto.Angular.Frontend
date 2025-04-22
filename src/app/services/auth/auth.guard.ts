import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['requiredRoles'];

  if (authService.isAuthenticated()) {
    if (requiredRoles && authService.userHasAnyRole(requiredRoles)) {
      return true;
    } else {
      // console.error(requiredRoles && authService.userHasAnyRole(requiredRoles));
      // console.error(requiredRoles);
      // console.error(authService.userHasAnyRole(requiredRoles));
      // console.warn(authService.getRole());
      router.navigate(['/access-denied']);
      return false;
    }
    
  } else {
    router.navigate(['/login']);
    return false;
  }
};