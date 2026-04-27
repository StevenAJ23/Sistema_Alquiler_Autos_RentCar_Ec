import { useMutation } from '@tanstack/vue-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import type { LoginCredentials, RegisterData } from '@/types/domain';

export function useLogin() {
  const auth = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (res) => {
      const { user, token } = res.data;
      auth.setAuth(user, token);
      router.push(user.role === 'ADMIN' ? '/admin' : '/');
    },
  });
}

export function useRegister() {
  const auth = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (res) => {
      const { user, token } = res.data;
      auth.setAuth(user, token);
      router.push('/');
    },
  });
}

export function useLogout() {
  const auth = useAuthStore();
  const router = useRouter();

  return () => {
    auth.clearAuth();
    router.push('/login');
  };
}
