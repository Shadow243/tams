import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { hidePreloader } from "@/utils/ui-utils";
import { useAuthStore } from "@/stores/auth";

export default async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): Promise<void> => {
    const store = useAuthStore();
    //   const pathname = window.location.pathname;

    if (store.user === null) {
        try {
            await store.fetchUser();
            console.log("User fetched successfully:", store.user);
            hidePreloader();
        } catch (e) {
            // Optionally handle error here or ignore
            console.log("Error fetching user:", e);
        }
    }

    next();
};
