import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { hidePreloader } from "@/utils/ui-utils";
import { useAuthStore } from "@/stores/auth";
import { axiosInstance } from "@/plugins/axios";

export default async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): Promise<void> => {
    const store = useAuthStore();
    
    // Restore token to axios if exists
    if (store.token && !axiosInstance.defaults.headers.common['Authorization']) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${store.token}`;
    }

    if (store.user === null && store.token) {
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
