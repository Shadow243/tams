import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const store = useAuthStore();
  console.log("Guest middleware triggered for route:", store.check);
  if (store.check) {
    next({ name: "home" });
  } else {
    next();
  }
};
