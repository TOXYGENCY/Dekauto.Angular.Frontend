import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['requiredRoles'];

  if (requiredRoles && authService.userHasAnyRole(requiredRoles)) {
    return true;
  } else {

    router.navigate(['/access-denied']);
    return false;
  }

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};